import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface UploadMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UploadMealDialog = ({ open, onOpenChange }: UploadMealDialogProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [foodName, setFoodName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!preview) {
      toast.error("Please upload a photo first");
      return;
    }
    toast.success("Meal photo uploaded successfully!");
    setPreview(null);
    setFoodName("");
    onOpenChange(false);
  };

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Meal Photo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!preview ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your meal photo here
              </p>
              <p className="text-xs text-muted-foreground mb-4">or</p>
              <Label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>Choose File</span>
                </Button>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="relative">
              <img
                src={preview}
                alt="Meal preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearPreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div>
            <Label htmlFor="food-name">Food Name (Optional)</Label>
            <Input
              id="food-name"
              placeholder="e.g., Grilled Chicken Salad"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
