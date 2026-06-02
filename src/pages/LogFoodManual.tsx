import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FoodDetailDialog } from "@/components/FoodDetailDialog";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";

// Local images for the curated master-food card display
import chickenSalad from "@/assets/food-chicken-salad.jpg";
import oatmeal from "@/assets/food-oatmeal.jpg";
import proteinShake from "@/assets/food-protein-shake.jpg";
import salmonRice from "@/assets/food-salmon-rice.jpg";
import bananaPancake from "@/assets/food-banana-pancake.jpg";
import yogurtGranola from "@/assets/food-yogurt-granola.jpg";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FoodItem {
  id: number | string;
  name: string;
  image: string;
  calories: number;
  mealTime: string;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
}

// ─── Curated local food catalog (display only — actual nutrition comes from DB)
// Images are local assets; nutrition data is authoritative from master_foods table.
const LOCAL_FOOD_CATALOG: FoodItem[] = [
  { id: 1, name: "Grilled Chicken Salad", image: chickenSalad, calories: 350, mealTime: "Lunch",     protein: 28, fat: 12, carbs: 40, fiber: 5, sugar: 6 },
  { id: 2, name: "Oatmeal With Berries",  image: oatmeal,       calories: 280, mealTime: "Breakfast", protein: 8,  fat: 5,  carbs: 52, fiber: 8, sugar: 12 },
  { id: 3, name: "Protein Shake",         image: proteinShake,  calories: 210, mealTime: "Snack",     protein: 25, fat: 3,  carbs: 20, fiber: 2, sugar: 5 },
  { id: 4, name: "Brown Rice + Salmon",   image: salmonRice,    calories: 540, mealTime: "Dinner",    protein: 35, fat: 18, carbs: 55, fiber: 4, sugar: 2 },
  { id: 5, name: "Banana Pancake",        image: bananaPancake, calories: 320, mealTime: "Breakfast", protein: 12, fat: 8,  carbs: 48, fiber: 4, sugar: 15 },
  { id: 6, name: "Greek Yogurt Granola",  image: yogurtGranola, calories: 190, mealTime: "Snack",     protein: 15, fat: 4,  carbs: 28, fiber: 3, sugar: 10 },
];

// ─── Component ────────────────────────────────────────────────────────────────

const LogFoodManual = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuthContext();

  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const filteredFoods = LOCAL_FOOD_CATALOG.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleFoodClick = (food: FoodItem) => {
    setSelectedFood(food);
    setDialogOpen(true);
  };

  /**
   * handleAddFood — POSTs to /api/food/logs (manual entry endpoint).
   *
   * This replaces the old localStorage approach. The food entry is now
   * persisted in Supabase (food_logs table) and will appear in Statistics.
   */
  const handleAddFood = async (food: FoodItem) => {
    if (!accessToken) {
      toast.error("Please log in to add food.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await apiFetch("/api/food/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          food_name:   food.name,
          calories:    food.calories,
          protein:     food.protein,
          carbs:       food.carbs,
          fat:         food.fat,
          fiber:       food.fiber,
          meal_type:   food.mealTime.toLowerCase(),
          source:      "manual",
          consumed_at: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? `Server error ${response.status}`);
      }

      toast.success(`✅ ${food.name} added to your log!`);
      setDialogOpen(false);

      // Brief delay then navigate to statistics to see the update
      setTimeout(() => navigate("/statistics"), 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add food. Try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-1">Log Food Manually</h1>
        <p className="text-muted-foreground mb-6">
          Select a food to log it to your daily intake. It will appear in Statistics immediately.
        </p>

        {/* Search bar */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search food..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {filteredFoods.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No food found for "{search}"</p>
            <p className="text-sm mt-1">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFoods.map((food) => (
              <Card
                key={food.id}
                className="overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-glow animate-fade-in"
                onClick={() => handleFoodClick(food)}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{food.name}</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{food.calories} kcal</p>
                      <p className="text-sm text-muted-foreground capitalize">{food.mealTime}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground space-y-0.5">
                      <p>P: {food.protein}g</p>
                      <p>C: {food.carbs}g</p>
                      <p>F: {food.fat}g</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <FoodDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        food={selectedFood}
        onAddFood={handleAddFood}
        submitting={submitting}
      />
    </div>
  );
};

export default LogFoodManual;
