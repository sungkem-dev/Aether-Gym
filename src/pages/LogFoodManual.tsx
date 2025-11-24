import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FoodDetailDialog } from "@/components/FoodDetailDialog";
import chickenSalad from "@/assets/food-chicken-salad.jpg";
import oatmeal from "@/assets/food-oatmeal.jpg";
import proteinShake from "@/assets/food-protein-shake.jpg";
import salmonRice from "@/assets/food-salmon-rice.jpg";
import bananaPancake from "@/assets/food-banana-pancake.jpg";
import yogurtGranola from "@/assets/food-yogurt-granola.jpg";

interface FoodItem {
  id: number;
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

const foodData: FoodItem[] = [
  {
    id: 1,
    name: "Grilled Chicken Salad",
    image: chickenSalad,
    calories: 350,
    mealTime: "Lunch",
    protein: 28,
    fat: 12,
    carbs: 40,
    fiber: 5,
    sugar: 6,
  },
  {
    id: 2,
    name: "Oatmeal With Berries",
    image: oatmeal,
    calories: 280,
    mealTime: "Breakfast",
    protein: 8,
    fat: 5,
    carbs: 52,
    fiber: 8,
    sugar: 12,
  },
  {
    id: 3,
    name: "Protein Shake Chocolate",
    image: proteinShake,
    calories: 210,
    mealTime: "Snack",
    protein: 25,
    fat: 3,
    carbs: 20,
    fiber: 2,
    sugar: 5,
  },
  {
    id: 4,
    name: "Brown Rice + Salmon",
    image: salmonRice,
    calories: 540,
    mealTime: "Dinner",
    protein: 35,
    fat: 18,
    carbs: 55,
    fiber: 4,
    sugar: 2,
  },
  {
    id: 5,
    name: "Banana Pancake",
    image: bananaPancake,
    calories: 320,
    mealTime: "Breakfast",
    protein: 12,
    fat: 8,
    carbs: 48,
    fiber: 4,
    sugar: 15,
  },
  {
    id: 6,
    name: "Greek Yogurt Granola",
    image: yogurtGranola,
    calories: 190,
    mealTime: "Snack",
    protein: 15,
    fat: 4,
    carbs: 28,
    fiber: 3,
    sugar: 10,
  },
];

const LogFoodManual = () => {
  const navigate = useNavigate();
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleFoodClick = (food: FoodItem) => {
    setSelectedFood(food);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Log Food Manually</h1>
        <p className="text-muted-foreground mb-8">Select a food item to view detailed nutrition information</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodData.map((food) => (
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
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <FoodDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        food={selectedFood}
      />
    </div>
  );
};

export default LogFoodManual;
