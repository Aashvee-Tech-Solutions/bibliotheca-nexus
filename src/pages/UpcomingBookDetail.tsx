import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft, Users, IndianRupee, Calendar, Globe, Share, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
  position_pricing: any[];
  slug: string;
  authorship_purchases?: any[];
}

const UpcomingBookDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [book, setBook] = useState<UpcomingBook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBookBySlug(slug);
    }
  }, [slug]);

  const fetchBookBySlug = async (bookSlug: string) => {
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
        .eq('slug', bookSlug)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "Book Not Found",
            description: "The upcoming book you're looking for doesn't exist or may have been removed.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      setBook({
        ...data,
        position_pricing: Array.isArray(data.position_pricing) ? data.position_pricing : []
      });
    } catch (error) {
      console.error('Error fetching upcoming book:', error);
      toast({
        title: "Error",
        description: "Failed to load book details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseClick = () => {
    if (!user) {
      navigate('/auth', { state: { from: { pathname: `/upcoming-book/${slug}` } } });
      return;
    }
    navigate(`/purchase/${book?.id}`);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${book?.title} - Co-Authorship Opportunity`,
      text: `Join as a co-author for "${book?.title}" - Limited positions available!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading book details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Book Not Found</h1>
            <p className="text-muted-foreground mb-4">The upcoming book you're looking for doesn't exist.</p>
            <Link to="/upcoming-books">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Upcoming Books
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const soldPositions = book.authorship_purchases?.filter(p => p.payment_status === 'completed') || [];
  const isAvailable = book.available_positions > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/upcoming-books" className="hover:text-foreground">Upcoming Books</Link>
          <span>/</span>
          <span className="text-foreground">{book.title}</span>
        </nav>
      </div>

      {/* Book Details */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Book Cover */}
          <div className="space-y-4">
            <div className="aspect-[3/4] max-w-md mx-auto lg:mx-0 relative">
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
              
              {/* Availability Badge */}
              <div className="absolute top-4 right-4">
                <Badge variant={isAvailable ? "default" : "secondary"}>
                  {isAvailable ? "Available" : "Sold Out"}
                </Badge>
              </div>
            </div>
            
            {/* Share Button */}
            <div className="flex justify-center lg:justify-start">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="w-4 h-4 mr-1" />
                Share Opportunity
              </Button>
            </div>
          </div>

          {/* Book Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{book.genre}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Upcoming
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{book.title}</h1>
              
              {/* Availability Info */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center text-lg">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  <span className="font-semibold">{book.available_positions}</span>
                  <span className="text-muted-foreground">/{book.total_author_positions} positions available</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold mb-3">About This Publication</h3>
              <p className="text-muted-foreground leading-relaxed">
                {book.description || "An exciting upcoming publication seeking co-authors to contribute their expertise and insights."}
              </p>
            </div>

            {/* Position Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  Co-Authorship Positions & Pricing
                </CardTitle>
                <CardDescription>
                  Each position includes 2 physical copies of the published book
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {book.position_pricing?.map((pos: any, idx: number) => {
                  const isPurchased = soldPositions.some(p => p.position_purchased === pos.position);
                  return (
                    <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={isPurchased ? "secondary" : "default"}>
                          Position {pos.position}
                        </Badge>
                        {isPurchased && <Badge variant="outline">Sold</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-lg ${isPurchased ? "line-through text-muted-foreground" : "text-primary"}`}>
                          ₹{pos.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">+ 2 copies</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Publication Details */}
            <Card>
              <CardHeader>
                <CardTitle>Publication Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Positions:</span>
                  <span>{book.total_author_positions} co-authors</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Books per Author:</span>
                  <span>2 physical copies</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Book Copies:</span>
                  <span>{book.total_author_positions * 2} copies</span>
                </div>
                {book.publication_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Publication:</span>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(book.publication_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Genre:</span>
                  <span>{book.genre}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full" 
                onClick={handlePurchaseClick}
                disabled={!isAvailable}
              >
                {isAvailable ? (
                  <>
                    <Users className="w-5 h-5 mr-2" />
                    Join as Co-Author
                  </>
                ) : (
                  "All Positions Sold"
                )}
              </Button>
              
              {!user && isAvailable && (
                <p className="text-sm text-muted-foreground text-center">
                  Sign in required to purchase co-authorship position
                </p>
              )}
            </div>

            {/* Benefits */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle>Co-Author Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Your name listed as co-author</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">2 physical copies of the book</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Professional publication credit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Enhanced professional profile</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 text-center">How Co-Authorship Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Reserve Your Position</h3>
                <p className="text-sm text-muted-foreground">
                  Select and purchase your preferred co-author position with secure payment.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">Book Production</h3>
                <p className="text-sm text-muted-foreground">
                  We handle the complete publication process with professional editing and design.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Receive Your Books</h3>
                <p className="text-sm text-muted-foreground">
                  Get your physical copies and enjoy your published co-author status.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UpcomingBookDetail;