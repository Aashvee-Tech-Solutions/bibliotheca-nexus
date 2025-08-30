import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Users, IndianRupee, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface UpcomingBook {
  id: string;
  title: string;
  genre: string;
  description: string;
  cover_image_url: string;
  total_author_positions: number;
  available_positions: number;
  price_per_position: number;
  publication_date: string;
  status: string;
  copy_allocation?: any;
  authorship_purchases?: any[];
}

const UpcomingBooks = () => {
  const [books, setBooks] = useState<UpcomingBook[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUpcomingBooks();
  }, []);

  const fetchUpcomingBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('upcoming_books')
        .select(`
          *,
          authorship_purchases (
            id,
            user_id,
            position_purchased,
            payment_status,
            total_amount,
            created_at
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching upcoming books:', error);
      toast({
        title: "Error",
        description: "Failed to load upcoming books",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseClick = (bookId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or signup to purchase an authorship position"
      });
      return;
    }
    // Navigate to purchase page
    window.location.href = `/purchase/${bookId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading upcoming books...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Upcoming Publications</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join our collaborative publishing platform and become a co-author of exciting upcoming books. 
            Purchase authorship positions and contribute to groundbreaking publications.
          </p>
          <Badge variant="secondary" className="text-sm">
            <BookOpen className="w-4 h-4 mr-2" />
            Collaborative Publishing Platform
          </Badge>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {books.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Upcoming Books</h3>
              <p className="text-muted-foreground">
                We're working on exciting new publications. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map((book) => (
                <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] relative overflow-hidden">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge variant={book.available_positions > 0 ? "default" : "secondary"}>
                        {book.available_positions > 0 ? "Available" : "Sold Out"}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                    <CardDescription>
                      <Badge variant="outline" className="mb-2">{book.genre}</Badge>
                      <p className="line-clamp-3">{book.description}</p>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-1" />
                        {book.available_positions}/{book.total_author_positions} positions
                      </div>
                    </div>
                    
                    {/* Show position-wise pricing */}
                    {book.copy_allocation && book.copy_allocation[book.total_author_positions.toString()]?.positions && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Position Pricing:</div>
                        {book.copy_allocation[book.total_author_positions.toString()].positions.map((pos: any, idx: number) => {
                          const isPurchased = book.authorship_purchases?.some((purchase: any) => 
                            purchase.payment_status === 'completed' && purchase.position_purchased === pos.position
                          );
                          return (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className={isPurchased ? "line-through text-muted-foreground" : ""}>
                                Position {pos.position}:
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold ${isPurchased ? "line-through text-muted-foreground" : "text-primary"}`}>
                                  ₹{pos.price.toLocaleString()}
                                </span>
                                {isPurchased && (
                                  <Badge variant="secondary" className="text-xs">Sold</Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {book.publication_date && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarDays className="w-4 h-4 mr-1" />
                        Publication: {new Date(book.publication_date).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full"
                      disabled={book.available_positions === 0}
                      onClick={() => handlePurchaseClick(book.id)}
                    >
                      {book.available_positions > 0 ? "Purchase Position" : "Sold Out"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Your Book</h3>
              <p className="text-muted-foreground">
                Browse our upcoming publications and select the book that aligns with your interests and expertise.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Your Position</h3>
              <p className="text-muted-foreground">
                Complete your profile, make payment, and secure your co-authorship position in the selected publication.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Collaborate & Publish</h3>
              <p className="text-muted-foreground">
                Work with our editorial team and fellow authors to create a high-quality publication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Become a Published Author?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community of authors and make your mark in the publishing world.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UpcomingBooks;