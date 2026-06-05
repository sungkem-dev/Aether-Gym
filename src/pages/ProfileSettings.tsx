import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ProfileSettings = () => {
  const { accessToken, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "male",
    activity_level: "sedentary"
  });

  const [tdeeResults, setTdeeResults] = useState<{
    bmr: number;
    tdee: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);

  // You can fetch existing user profile data here if desired

  const calculateTDEE = () => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height);
    const a = parseInt(formData.age);

    if (!w || !h || !a) {
      toast.error("Please fill in height, weight, and age");
      return;
    }

    // Mifflin-St Jeor
    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr += formData.gender === "male" ? 5 : -161;

    let multiplier = 1.2;
    switch (formData.activity_level) {
      case "light": multiplier = 1.375; break;
      case "moderate": multiplier = 1.55; break;
      case "active": multiplier = 1.725; break;
      case "very_active": multiplier = 1.9; break;
    }

    const tdee = Math.round(bmr * multiplier);
    
    // 30% Protein, 40% Carbs, 30% Fat
    const protein = Math.round((tdee * 0.3) / 4);
    const carbs = Math.round((tdee * 0.4) / 4);
    const fat = Math.round((tdee * 0.3) / 9);

    setTdeeResults({
      bmr: Math.round(bmr),
      tdee,
      protein,
      carbs,
      fat
    });
  };

  const handleSave = async () => {
    if (!tdeeResults) {
      toast.error("Please calculate your TDEE first");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        age: parseInt(formData.age),
        daily_calories: tdeeResults.tdee,
        daily_protein: tdeeResults.protein,
        daily_carbs: tdeeResults.carbs,
        daily_fat: tdeeResults.fat,
      };

      await apiFetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });
      toast.success("Profile & Diet Plan saved successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Diet Plan Generator</h1>
        </div>

        <Card className="p-6">
          <p className="text-muted-foreground mb-6">
            Enter your physical metrics below. We use the Mifflin-St Jeor formula to accurately calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Height (cm)</Label>
                <Input 
                  type="number" 
                  value={formData.height} 
                  onChange={e => setFormData({ ...formData, height: e.target.value })} 
                  placeholder="175"
                />
              </div>
              <div>
                <Label>Weight (kg)</Label>
                <Input 
                  type="number" 
                  value={formData.weight} 
                  onChange={e => setFormData({ ...formData, weight: e.target.value })} 
                  placeholder="70"
                />
              </div>
              <div>
                <Label>Age (years)</Label>
                <Input 
                  type="number" 
                  value={formData.age} 
                  onChange={e => setFormData({ ...formData, age: e.target.value })} 
                  placeholder="25"
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={v => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Activity Level</Label>
                <Select value={formData.activity_level} onValueChange={v => setFormData({ ...formData, activity_level: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (Little or no exercise)</SelectItem>
                    <SelectItem value="light">Light (Exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (Exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (Exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (Hard exercise daily)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={calculateTDEE} variant="outline" className="w-full">
                <Calculator className="h-4 w-4 mr-2" /> Calculate Diet Plan
              </Button>
            </div>

            {tdeeResults && (
              <div className="bg-muted p-6 rounded-lg space-y-4 animate-fade-in border border-border">
                <h3 className="font-bold text-xl">Your Personalized Plan</h3>
                
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">BMR</span>
                  <span className="font-medium">{tdeeResults.bmr} kcal/day</span>
                </div>
                
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground text-primary font-bold">Daily TDEE</span>
                  <span className="font-bold text-primary">{tdeeResults.tdee} kcal/day</span>
                </div>

                <div className="pt-4">
                  <p className="text-sm font-semibold mb-3">Daily Macro Targets</p>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="bg-blue-500/10 text-blue-500 rounded p-2">
                      <div className="font-bold">{tdeeResults.protein}g</div>
                      <div className="text-xs">Protein (30%)</div>
                    </div>
                    <div className="bg-yellow-500/10 text-yellow-500 rounded p-2">
                      <div className="font-bold">{tdeeResults.carbs}g</div>
                      <div className="text-xs">Carbs (40%)</div>
                    </div>
                    <div className="bg-orange-500/10 text-orange-500 rounded p-2">
                      <div className="font-bold">{tdeeResults.fat}g</div>
                      <div className="text-xs">Fat (30%)</div>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSave} variant="hero" className="w-full mt-4" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save to Profile
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
