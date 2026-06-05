import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabaseClient.js';

export const getComplaints = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('complaints')
      .select('*, users(email, name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFoodLogs = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('food_logs')
      .select('*, users(email, name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFoodLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('food_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMemberships = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('memberships')
      .select('*, users(email, name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateComplaintStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabaseAdmin
      .from('complaints')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
