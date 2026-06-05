import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AdminDashboard = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("complaints");

  const [complaints, setComplaints] = useState<any[]>([]);
  const [foodLogs, setFoodLogs] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      if (activeTab === "complaints") {
        const res = await apiFetch("/api/admin/complaints", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await res.json();
        if (data.success) setComplaints(data.data);
      } else if (activeTab === "food_logs") {
        const res = await apiFetch("/api/admin/food-logs", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await res.json();
        if (data.success) setFoodLogs(data.data);
      } else if (activeTab === "memberships") {
        const res = await apiFetch("/api/admin/memberships", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await res.json();
        if (data.success) setMemberships(data.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveComplaint = async (id: string) => {
    try {
      await apiFetch(`/api/admin/complaints/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ status: "resolved" })
      });
      toast.success("Complaint resolved");
      fetchData();
    } catch (err) {
      toast.error("Failed to update complaint");
    }
  };

  const handleDeleteFoodLog = async (id: string) => {
    if (!confirm("Delete this food log?")) return;
    try {
      await apiFetch(`/api/admin/food-logs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      toast.success("Food log deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete food log");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
            <TabsTrigger value="food_logs">Food Logs</TabsTrigger>
            <TabsTrigger value="memberships">Memberships</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <TabsContent value="complaints" className="space-y-4">
                {complaints.length === 0 ? (
                  <p className="text-muted-foreground text-center p-8">No complaints found.</p>
                ) : (
                  complaints.map(c => (
                    <Card key={c.id} className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{c.subject}</h3>
                        <p className="text-sm text-muted-foreground">{c.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          From: {c.users?.email} | Status: {c.status}
                        </p>
                      </div>
                      {c.status === 'open' && (
                        <Button onClick={() => handleResolveComplaint(c.id)}>Resolve</Button>
                      )}
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="food_logs" className="space-y-4">
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Food Name</th>
                        <th className="px-6 py-3">Calories</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {foodLogs.map(log => (
                        <tr key={log.id} className="border-b bg-card">
                          <td className="px-6 py-4">{log.users?.email}</td>
                          <td className="px-6 py-4 font-medium">{log.food_name}</td>
                          <td className="px-6 py-4">{log.calories} kcal</td>
                          <td className="px-6 py-4">{new Date(log.consumed_at).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <Button variant="destructive" size="icon" onClick={() => handleDeleteFoodLog(log.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="memberships" className="space-y-4">
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Plan</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Valid Until</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberships.map(m => (
                        <tr key={m.id} className="border-b bg-card">
                          <td className="px-6 py-4">{m.users?.email}</td>
                          <td className="px-6 py-4">{m.plan_name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${m.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">{m.end_date ? new Date(m.end_date).toLocaleDateString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};
