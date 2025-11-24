import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FoodDetail {
  name: string;
  image: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
}

interface FoodDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  food: FoodDetail | null;
}

export const FoodDetailDialog = ({ open, onOpenChange, food }: FoodDetailDialogProps) => {
  if (!food) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{food.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-64 object-cover rounded-lg"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Calories</p>
              <p className="text-2xl font-bold text-primary">{food.calories} kcal</p>
            </div>
            
            <div className="bg-secondary/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Protein</p>
              <p className="text-2xl font-bold text-secondary">{food.protein}g</p>
            </div>
            
            <div className="bg-accent/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Fat</p>
              <p className="text-2xl font-bold text-accent">{food.fat}g</p>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Carbs</p>
              <p className="text-2xl font-bold text-primary">{food.carbs}g</p>
            </div>
            
            <div className="bg-secondary/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Fiber</p>
              <p className="text-2xl font-bold text-secondary">{food.fiber}g</p>
            </div>
            
            <div className="bg-accent/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Sugar</p>
              <p className="text-2xl font-bold text-accent">{food.sugar}g</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
