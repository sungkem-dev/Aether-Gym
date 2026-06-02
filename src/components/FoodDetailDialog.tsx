import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FoodDetail {
  name: string;
  image: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
  mealTime: string;
}

interface FoodDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  food: FoodDetail | null;
  onAddFood?: (food: FoodDetail) => void;
  /** Shows a loading spinner on the Add button while the API call is in-flight */
  submitting?: boolean;
}

export const FoodDetailDialog = ({
  open,
  onOpenChange,
  food,
  onAddFood,
  submitting = false,
}: FoodDetailDialogProps) => {
  if (!food) return null;

  const handleAddFood = () => {
    if (onAddFood && food && !submitting) {
      onAddFood(food);
      // Don't close here — parent closes after successful API call
    }
  };

  const macros = [
    { label: "Calories", value: `${food.calories} kcal`, color: "bg-primary/5 text-primary" },
    { label: "Protein",  value: `${food.protein}g`,      color: "bg-secondary/5 text-secondary" },
    { label: "Fat",      value: `${food.fat}g`,          color: "bg-orange-500/5 text-orange-400" },
    { label: "Carbs",    value: `${food.carbs}g`,        color: "bg-yellow-500/5 text-yellow-400" },
    { label: "Fiber",    value: `${food.fiber}g`,        color: "bg-green-500/5 text-green-400" },
    { label: "Sugar",    value: `${food.sugar}g`,        color: "bg-pink-500/5 text-pink-400" },
  ];

  return (
    <Dialog open={open} onOpenChange={submitting ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{food.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-48 object-cover rounded-lg"
          />

          <p className="text-sm text-muted-foreground capitalize">
            Suggested for: <strong>{food.mealTime}</strong>
          </p>

          <div className="grid grid-cols-3 gap-2">
            {macros.map(({ label, value, color }) => (
              <div key={label} className={`${color} p-3 rounded-lg`}>
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className="text-base font-bold">{value}</p>
              </div>
            ))}
          </div>

          <Button
            onClick={handleAddFood}
            className="w-full"
            size="lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding to log...
              </>
            ) : (
              "Add to Food Log"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
