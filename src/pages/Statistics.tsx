import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "@/hooks/use-toast";

interface AddedFood {
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
  addedAt: string;
}

const dailyCaloriesData = [
  { day: "Monday", calories: 1920 },
  { day: "Tuesday", calories: 2100 },
  { day: "Wednesday", calories: 1810 },
  { day: "Thursday", calories: 2000 },
  { day: "Friday", calories: 2200 },
  { day: "Saturday", calories: 1950 },
  { day: "Sunday", calories: 2050 },
];

const weeklyMacrosData = [
  { name: "Protein", grams: 780 },
  { name: "Carbohydrates", grams: 1320 },
  { name: "Fat", grams: 420 },
];

const Statistics = () => {
  const navigate = useNavigate();
  const [addedFoods, setAddedFoods] = useState<AddedFood[]>([]);

  useEffect(() => {
    // Load added foods from localStorage
    const storedFoods = localStorage.getItem("addedFoods");
    if (storedFoods) {
      setAddedFoods(JSON.parse(storedFoods));
    }
  }, []);

  const handleDeleteFood = (index: number) => {
    const updatedFoods = addedFoods.filter((_, i) => i !== index);
    setAddedFoods(updatedFoods);
    localStorage.setItem("addedFoods", JSON.stringify(updatedFoods));
    
    toast({
      title: "Food Removed",
      description: "The food item has been removed from your log.",
    });
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
        <h1 className="text-3xl font-bold mb-2">Diet Statistics</h1>
        <p className="text-muted-foreground mb-8">Track your nutrition progress over time</p>

        <div className="space-y-8">
          {/* Added Foods Section */}
          {addedFoods.length > 0 && (
            <Card className="p-6 animate-fade-in">
              <h2 className="text-xl font-bold mb-4">Your Added Meals</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addedFoods.map((food, index) => (
                  <div
                    key={index}
                    className="relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-glow transition-all"
                  >
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{food.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize mb-2">
                        {food.mealTime}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-primary">
                          {food.calories} kcal
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFood(index)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Daily Calories Chart */}
          <Card className="p-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-6">Daily Calories - Last 7 Days</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyCaloriesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="day" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Weekly Macros Chart */}
          <Card className="p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-xl font-bold mb-6">Weekly Macronutrients Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyMacrosData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Grams', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="grams" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-sm text-muted-foreground mb-2">Average Daily Calories</h3>
              <p className="text-3xl font-bold text-primary">2004 kcal</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <h3 className="text-sm text-muted-foreground mb-2">Weekly Protein</h3>
              <p className="text-3xl font-bold text-secondary">780g</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <h3 className="text-sm text-muted-foreground mb-2">Weekly Carbs</h3>
              <p className="text-3xl font-bold text-accent">1320g</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
