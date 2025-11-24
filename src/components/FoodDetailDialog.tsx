import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
}

export const FoodDetailDialog = ({ open, onOpenChange, food, onAddFood }: FoodDetailDialogProps) => {
  if (!food) return null;

  const handleAddFood = () => {
    if (onAddFood && food) {
      onAddFood(food);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/5 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Calories</p>
              <p className="text-xl font-bold text-primary">{food.calories} kcal</p>
            </div>
            
            <div className="bg-secondary/5 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Protein</p>
              <p className="text-xl font-bold text-secondary">{food.protein}g</p>
            </div>
            
            <div className="bg-accent/5 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Fat</p>
              <p className="text-xl font-bold text-accent">{food.fat}g</p>
            </div>
            
            <div className="bg-primary/5 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Carbs</p>
              <p className="text-xl font-bold text-primary">{food.carbs}g</p>
            </div>
            
            <div className="bg-secondary/5 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Fiber</p>
              <p className="text-xl font-bold text-secondary">{food.fiber}g</p>
            </div>
            
            <div className="bg-accent/5 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Sugar</p>
              <p className="text-xl font-bold text-accent">{food.sugar}g</p>
            </div>
          </div>

          <Button 
            onClick={handleAddFood}
            className="w-full"
            size="lg"
          >
            Add Food
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
