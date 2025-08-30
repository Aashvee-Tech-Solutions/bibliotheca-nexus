import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Users, IndianRupee, BookOpen, Clock, CheckCircle, XCircle } from "lucide-react";

interface Purchase {
  id: string;
  positions_purchased: number;
  total_amount: number;
  payment_status: string;
  payment_id: string;
  phone_number: string;
  bio: string;
  profile_image_url: string;
  created_at: string;
  upcoming_books: {
    title: string;
    genre: string;
    description: string;
    cover_image_url: string;
    publication_date: string;
  };
}

const Dashboard = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserPurchases();
    }
  }, [user]);

  const fetchUserPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('authorship_purchases')
        .select(`
          *,
          upcoming_books (
            title,
            genre,
            description,
            cover_image_url,
            publication_date
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast({
        title: "Error",
        description: "Failed to load your purchases",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{purchases.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {purchases.reduce((sum, p) => sum + p.positions_purchased, 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{purchases.reduce((sum, p) => sum + p.total_amount, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchases List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Your Authorship Purchases</h2>
            
            {purchases.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Purchases Yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't purchased any authorship positions yet.
                  </p>
                  <a
                    href="/upcoming-books"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                  >
                    Browse Upcoming Books
                  </a>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {purchases.map((purchase) => (
                  <Card key={purchase.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-1">
                            {purchase.upcoming_books.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            <Badge variant="outline">{purchase.upcoming_books.genre}</Badge>
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(purchase.payment_status)}
                          <Badge className={getStatusColor(purchase.payment_status)}>
                            {purchase.payment_status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        {purchase.upcoming_books.cover_image_url ? (
                          <img
                            src={purchase.upcoming_books.cover_image_url}
                            alt={purchase.upcoming_books.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Positions:</span>
                            <span className="font-medium">{purchase.positions_purchased}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-medium">₹{purchase.total_amount.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Purchase Date:</span>
                            <span className="font-medium">
                              {new Date(purchase.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {purchase.upcoming_books.publication_date && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Publication:</span>
                              <span className="font-medium">
                                {new Date(purchase.upcoming_books.publication_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {purchase.payment_id && (
                        <div className="text-xs text-muted-foreground">
                          Payment ID: {purchase.payment_id}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;