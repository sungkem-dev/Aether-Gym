import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload, X, Loader2, CheckCircle, AlertCircle,
  Camera, FolderOpen, ArrowLeft, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Below this threshold the frontend sends auto_save=false and asks for manual confirmation */
const CONFIDENCE_THRESHOLD = 0.60;

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional: called after successful scan so the parent can refresh stats */
  onSuccess?: () => void;
}

interface ScanResult {
  food_log_id: string | null;
  food_name: string;
  detected_foods: string[];
  image_url: string;
  confidence: number;
  auto_saved: boolean;
  meal_type: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

// ─── Confidence badge helper ──────────────────────────────────────────────────

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  let color = "bg-green-500/15 text-green-400 border-green-500/30";
  let label = "High";
  if (pct < 70) {
    color = "bg-red-500/15 text-red-400 border-red-500/30";
    label = "Low";
  } else if (pct < 90) {
    color = "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
    label = "Medium";
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${color}`}>
      {pct}% {label}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const UploadMealDialog = ({ open, onOpenChange, onSuccess }: UploadMealDialogProps) => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mealType, setMealType] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  // Scan states
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Low-confidence manual correction states
  const [correctedName, setCorrectedName] = useState("");
  const [isSavingManual, setIsSavingManual] = useState(false);

  // ── File handling ───────────────────────────────────────────────────────────

  const handleFileSelected = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB.");
      return;
    }
    setSelectedFile(file);
    setScanResult(null);
    setCorrectedName("");

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
    // Reset value so the same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelected(file);
  };

  // ── AI Scan ─────────────────────────────────────────────────────────────────

  const handleScan = async () => {
    if (!selectedFile) {
      toast.error("Please upload a photo first.");
      return;
    }
    if (!accessToken) {
      toast.error("You must be logged in to use AI scanning.");
      return;
    }

    setIsScanning(true);
    toast.info("🔍 Analyzing your meal with AI... this may take a few seconds.");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      if (mealType) formData.append("meal_type", mealType.toLowerCase());

      // If confidence will be low, we don't know yet — let the backend always
      // auto_save for now. We'll handle the two-phase approach:
      // Phase 1: Scan with auto_save=true (optimistic)
      // But per the plan, we actually need the backend to decide...
      // Actually: we CAN'T know confidence before the scan. So we do:
      //   1) Send auto_save=true
      //   2) Check confidence in the response
      //   3) If low, the food was already saved — but that's okay since the user
      //      can correct it. Alternatively, always send auto_save=false and let
      //      the frontend always confirm.
      //
      // Cleanest UX: Send auto_save=false ALWAYS from this dialog.
      // High confidence? Show results + "Already analyzing..." then auto-save via /api/food/logs.
      // Low confidence? Show warning + manual correction + "Confirm & Save".
      //
      // This ensures the frontend is always in control.
      formData.append("auto_save", "false");

      const response = await fetch("/api/food/scan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? `Server error: ${response.status}`);
      }

      const result = data.data as ScanResult;
      setScanResult(result);
      setCorrectedName(result.food_name);

      // High confidence → auto-save immediately
      if (result.confidence >= CONFIDENCE_THRESHOLD) {
        await saveToFoodLog(result, result.food_name);
        toast.success(`✅ Detected: ${result.food_name} — ${result.nutrition.calories} kcal`);
      } else {
        toast.warning(`⚠️ Low confidence (${Math.round(result.confidence * 100)}%). Please review and correct if needed.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Scan failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsScanning(false);
    }
  };

  // ── Save to food_logs (manual or auto) ──────────────────────────────────────

  const saveToFoodLog = async (result: ScanResult, foodName: string) => {
    if (!accessToken) return;

    try {
      const res = await fetch("/api/food/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          food_name: foodName,
          calories: result.nutrition.calories,
          protein: result.nutrition.protein,
          carbs: result.nutrition.carbs,
          fat: result.nutrition.fat,
          fiber: result.nutrition.fiber,
          meal_type: result.meal_type || mealType || "snack",
          consumed_at: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to save food log");
      }

      // Mark as saved in local state
      setScanResult(prev => prev ? { ...prev, auto_saved: true } : null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      toast.error(msg);
    }
  };

  // ── Manual correction confirm ───────────────────────────────────────────────

  const handleConfirmAndSave = async () => {
    if (!scanResult || !correctedName.trim()) return;
    setIsSavingManual(true);

    await saveToFoodLog(scanResult, correctedName.trim());
    toast.success(`✅ Saved: ${correctedName.trim()} — ${scanResult.nutrition.calories} kcal`);
    setIsSavingManual(false);
  };

  // ── Dialog close / reset ────────────────────────────────────────────────────

  const handleClose = () => {
    if (scanResult?.auto_saved) {
      onSuccess?.();
    }
    setSelectedFile(null);
    setPreview(null);
    setMealType("");
    setScanResult(null);
    setCorrectedName("");
    onOpenChange(false);
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreview(null);
    setScanResult(null);
    setCorrectedName("");
  };

  // ── Is result in "needs review" state? ──────────────────────────────────────
  const needsReview = scanResult && scanResult.confidence < CONFIDENCE_THRESHOLD && !scanResult.auto_saved;

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); else onOpenChange(true); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Food Scanner</DialogTitle>
          <DialogDescription>
            Upload or snap a photo and our AI will identify the food and calculate its macros.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* POST-SCAN RESULT VIEW (Task 3)                                  */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {scanResult ? (
            <div className="space-y-4 animate-fade-in">
              {/* Image + food name header */}
              <div className="flex gap-4 items-start">
                {preview && (
                  <img
                    src={preview}
                    alt="Scanned meal"
                    className="w-24 h-24 object-cover rounded-xl border border-border flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <ConfidenceBadge confidence={scanResult.confidence} />
                    {scanResult.auto_saved && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Saved
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold leading-tight truncate">
                    {scanResult.food_name}
                  </h3>
                  {scanResult.detected_foods.length > 1 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Also: {scanResult.detected_foods.slice(1).join(", ")}
                    </p>
                  )}
                  {scanResult.image_url && (
                    <a
                      href={scanResult.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      View full image ↗
                    </a>
                  )}
                </div>
              </div>

              {/* ── Low confidence warning + manual correction (Task 1) ────── */}
              {needsReview && (
                <div className="border border-amber-500/30 bg-amber-500/5 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-300">We're not entirely sure about this food</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Confidence is only {Math.round(scanResult.confidence * 100)}%. Please review the name below and correct it if needed.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pencil className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      value={correctedName}
                      onChange={(e) => setCorrectedName(e.target.value)}
                      placeholder="Enter correct food name"
                      className="flex-1"
                    />
                  </div>
                  <Button
                    onClick={handleConfirmAndSave}
                    variant="hero"
                    className="w-full"
                    disabled={!correctedName.trim() || isSavingManual}
                  >
                    {isSavingManual ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                      <><CheckCircle className="h-4 w-4 mr-2" />Confirm & Save</>
                    )}
                  </Button>
                </div>
              )}

              {/* ── Full nutrition breakdown ──────────────────────────────────── */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold">Nutrition Breakdown</h4>

                {/* Primary: Calories */}
                <div className="text-center py-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                  <div className="text-3xl font-bold text-primary">
                    {scanResult.nutrition.calories}
                    <span className="text-sm font-normal text-muted-foreground ml-1">kcal</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Total Calories</div>
                </div>

                {/* Macros grid */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Protein", value: scanResult.nutrition.protein, unit: "g", color: "text-blue-400" },
                    { label: "Carbs", value: scanResult.nutrition.carbs, unit: "g", color: "text-yellow-400" },
                    { label: "Fat", value: scanResult.nutrition.fat, unit: "g", color: "text-orange-400" },
                    { label: "Fiber", value: scanResult.nutrition.fiber, unit: "g", color: "text-emerald-400" },
                  ].map(({ label, value, unit, color }) => (
                    <div key={label} className="bg-card rounded-md p-2.5 border border-border/50">
                      <div className={`text-lg font-bold ${color}`}>
                        {value}<span className="text-xs font-normal">{unit}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Action buttons ────────────────────────────────────────────── */}
              {scanResult.auto_saved && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleClose}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <Button
                    variant="hero"
                    className="flex-1"
                    onClick={() => {
                      onSuccess?.();
                      navigate("/statistics");
                      onOpenChange(false);
                    }}
                  >
                    View Statistics →
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* ════════════════════════════════════════════════════════════════ */
            /* IMAGE UPLOAD VIEW (pre-scan)                                   */
            /* ════════════════════════════════════════════════════════════════ */
            <>
              {!preview ? (
                /* ── Drop zone + camera/gallery buttons (Task 2) ─────────── */
                <div>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"
                      }`}
                  >
                    <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Drag & drop your meal photo here
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      JPEG, PNG, WebP up to 10MB
                    </p>

                    {/* Two-button capture UX */}
                    <div className="flex gap-3 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => cameraInputRef.current?.click()}
                        className="gap-2"
                      >
                        <Camera className="h-4 w-4" />
                        Take a Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => galleryInputRef.current?.click()}
                        className="gap-2"
                      >
                        <FolderOpen className="h-4 w-4" />
                        Upload from Gallery
                      </Button>
                    </div>

                    {/* Hidden file inputs */}
                    {/* Camera input — uses capture="environment" for rear camera on mobile */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {/* Gallery input — standard file picker, no capture attribute */}
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              ) : (
                /* ── Image preview ────────────────────────────────────────── */
                <div className="relative">
                  <img
                    src={preview}
                    alt="Meal preview"
                    className="w-full h-52 object-cover rounded-lg"
                  />
                  {!isScanning && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={clearImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                      <p className="text-white text-sm font-medium">Analyzing with AI...</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Meal Type Selector ─────────────────────────────────────── */}
              <div>
                <Label htmlFor="meal-type">Meal Time <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger id="meal-type">
                    <SelectValue placeholder="Select meal time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ── Scan button ────────────────────────────────────────────── */}
              <Button
                onClick={handleScan}
                className="w-full"
                variant="hero"
                disabled={!selectedFile || isScanning}
              >
                {isScanning ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Scanning...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" />Scan & Analyze Meal</>
                )}
              </Button>
            </>
          )}

          {/* ── Auth warning ────────────────────────────────────────────────── */}
          {!accessToken && (
            <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 rounded-md p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>You must be <strong>logged in</strong> to use AI scanning. <a href="/login" className="underline">Sign in</a></span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
