/**
 * midtrans.service.ts — Midtrans Payment Gateway Service
 *
 * Handles:
 *   1. Creating a Snap payment transaction (generates a payment URL/token)
 *   2. Verifying webhook notification signature from Midtrans
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SETUP GUIDE:
 *   1. Register at https://dashboard.midtrans.com/
 *   2. Sandbox keys: Settings > Access Keys > Sandbox
 *   3. Add to .env:
 *      MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
 *      MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
 *      MIDTRANS_IS_PRODUCTION=false
 *
 * WEBHOOK SETUP:
 *   In Midtrans Dashboard > Settings > Configuration > Payment Notification URL
 *   Set to: https://your-domain.com/api/payment/webhook
 *   (For local dev, use ngrok: ngrok http 3001)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axios from 'axios';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { createError } from '../middleware/errorHandler.js';

// ─── Midtrans API URLs ────────────────────────────────────────────────────────
// IMPORTANT: Midtrans Sandbox keys may NOT have the "SB-" prefix depending on
// when your account was created. The isProduction flag in server/.env is the
// authoritative source of truth — NOT the key prefix.
//
// If you see "Access denied" errors:
//   1. Ensure MIDTRANS_IS_PRODUCTION=false in server/.env
//   2. Ensure the key values have no trailing spaces/newlines (CRLF issue on Windows)
//   3. Make sure you are using the SERVER key (Mid-server-*) on the backend,
//      and the CLIENT key (Mid-client-*) in index.html for the Snap.js widget.
const IS_PRODUCTION = env.MIDTRANS_IS_PRODUCTION;

const MIDTRANS_SNAP_URL = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

// ── Startup diagnostic ────────────────────────────────────────────────────────
const _rawServerKey = env.MIDTRANS_SERVER_KEY.trim();
const _rawClientKey = env.MIDTRANS_CLIENT_KEY.trim();

// Detect if keys are swapped — a common mistake
const serverKeyLooksWrong = _rawServerKey.toLowerCase().includes('client');
const clientKeyLooksWrong = _rawClientKey.toLowerCase().includes('server');

console.log('');
console.log('━━━ Midtrans Config ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  Mode:        ${IS_PRODUCTION ? 'PRODUCTION 🔴' : 'SANDBOX 🟡'}`);
console.log(`  Snap URL:    ${MIDTRANS_SNAP_URL}`);
console.log(`  SERVER_KEY:  ${_rawServerKey.substring(0, 30)}...  ${serverKeyLooksWrong ? '❌ LOOKS LIKE A CLIENT KEY!' : '✅'}`);
console.log(`  CLIENT_KEY:  ${_rawClientKey.substring(0, 30)}...  ${clientKeyLooksWrong ? '❌ LOOKS LIKE A SERVER KEY!' : '✅'}`);
console.log(`  Auth header: Basic ${Buffer.from(_rawServerKey + ':').toString('base64').substring(0, 20)}...`);
if (serverKeyLooksWrong || clientKeyLooksWrong) {
  console.error('  ⚠️  KEYS ARE SWAPPED IN server/.env! Swap MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY values.');
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

export interface MidtransWebhookPayload {
  order_id: string;
  transaction_id: string;
  transaction_status: string;
  payment_type: string;
  gross_amount: string;
  signature_key: string;
  status_code: string;
  fraud_status?: string;
}

export interface MembershipPlan {
  name: string;
  price: number;
  durationMonths: number;
}

// Available membership plans
export const MEMBERSHIP_PLANS: Record<string, MembershipPlan> = {
  monthly: {
    name: 'Monthly Membership',
    price: 299_000,  // IDR 299,000
    durationMonths: 1,
  },
  quarterly: {
    name: 'Quarterly Membership',
    price: 799_000,  // IDR 799,000
    durationMonths: 3,
  },
  annual: {
    name: 'Annual Membership',
    price: 2_499_000, // IDR 2,499,000
    durationMonths: 12,
  },
};

/**
 * createSnapTransaction — Creates a Midtrans Snap payment transaction.
 * Returns a `token` and `redirect_url` to send to the frontend.
 */
export async function createSnapTransaction(
  orderId: string,
  userId: string,
  userEmail: string,
  userName: string,
  planId: string
): Promise<{ token: string; redirect_url: string }> {
  const plan = MEMBERSHIP_PLANS[planId];
  if (!plan) {
    throw createError(400, `Invalid plan ID: "${planId}". Valid plans: ${Object.keys(MEMBERSHIP_PLANS).join(', ')}`);
  }

  // Use the module-level trimmed key (already validated at startup).
  // Format: Basic base64("SERVER_KEY:") — colon after key, password is empty.
  const authHeader = Buffer.from(`${_rawServerKey}:`).toString('base64');

  // Per-request debug log — remove after confirming Midtrans works
  console.log(`[Midtrans TX] orderId=${orderId} planId=${planId}`);
  console.log(`[Midtrans TX] serverKey starts with: ${_rawServerKey.substring(0, 15)}...`);
  console.log(`[Midtrans TX] Base64 auth (first 20): ${authHeader.substring(0, 20)}...`);
  console.log(`[Midtrans TX] Endpoint: POST ${MIDTRANS_SNAP_URL}`);

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: plan.price,
    },
    item_details: [
      {
        id: planId,
        price: plan.price,
        quantity: 1,
        name: plan.name,
      },
    ],
    customer_details: {
      first_name: userName,
      email: userEmail,
    },
    // Metadata stored in Midtrans for reference
    custom_field1: userId,
    custom_field2: planId,
  };

  try {
    const response = await axios.post<{ token: string; redirect_url: string }>(
      MIDTRANS_SNAP_URL,
      payload,
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw createError(
        502,
        `Midtrans API error: ${err.response?.data?.error_messages?.join(', ') ?? err.message}`
      );
    }
    throw createError(500, 'Unexpected error creating Midtrans transaction');
  }
}

/**
 * verifyWebhookSignature — Validates the Midtrans notification signature.
 *
 * Midtrans signs webhooks using:
 *   SHA-512(order_id + status_code + gross_amount + server_key)
 *
 * This must be verified BEFORE processing any payment state changes.
 */
export function verifyWebhookSignature(payload: MidtransWebhookPayload): boolean {
  const rawString = `${payload.order_id}${payload.status_code}${payload.gross_amount}${env.MIDTRANS_SERVER_KEY}`;
  const expectedSignature = crypto
    .createHash('sha512')
    .update(rawString)
    .digest('hex');

  return expectedSignature === payload.signature_key;
}

/**
 * Determines if a webhook payload represents a successful payment.
 * Handles 'settlement' (for bank transfer) and 'capture' (for card payments).
 */
export function isPaymentSuccessful(payload: MidtransWebhookPayload): boolean {
  const { transaction_status, fraud_status } = payload;

  if (transaction_status === 'capture') {
    return fraud_status === 'accept';
  }
  return transaction_status === 'settlement';
}
