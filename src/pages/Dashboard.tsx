import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Upload, TrendingUp, Apple, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UploadMealDialog } from "@/components/UploadMealDialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [stats] = useState({
    caloriesConsumed: 1850,
    caloriesTarget: 2200,
    proteinIntake: 120,
    carbsIntake: 180,
    fatsIntake: 65,
  });

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Member Dashboard</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Daily Calories</h3>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">
                {stats.caloriesConsumed}
                <span className="text-lg text-muted-foreground">/{stats.caloriesTarget}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(stats.caloriesConsumed / stats.caloriesTarget) * 100}%` }}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Protein</h3>
              <Apple className="h-5 w-5 text-secondary" />
            </div>
            <div className="text-3xl font-bold">{stats.proteinIntake}g</div>
            <p className="text-sm text-muted-foreground mt-2">Target: 150g</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Meals Today</h3>
              <Upload className="h-5 w-5 text-accent" />
            </div>
            <div className="text-3xl font-bold">4</div>
            <p className="text-sm text-muted-foreground mt-2">3 meals logged</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mb-8 animate-slide-up">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setUploadDialogOpen(true)}
            >
              <Upload className="h-6 w-6" />
              <span>Upload Meal Photo</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate("/log-food-manual")}
            >
              <Apple className="h-6 w-6" />
              <span>Log Food Manually</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate("/statistics")}
            >
              <TrendingUp className="h-6 w-6" />
              <span>View Statistics</span>
            </Button>
          </div>
        </Card>

        {/* Macro Breakdown */}
        <Card className="p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-xl font-bold mb-6">Today's Nutrition</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Protein</span>
                <span className="text-sm text-muted-foreground">{stats.proteinIntake}g / 150g</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full" style={{ width: "80%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Carbohydrates</span>
                <span className="text-sm text-muted-foreground">{stats.carbsIntake}g / 250g</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "72%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Fats</span>
                <span className="text-sm text-muted-foreground">{stats.fatsIntake}g / 75g</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: "87%" }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <UploadMealDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />
    </div>
  );
};

export default Dashboard;
