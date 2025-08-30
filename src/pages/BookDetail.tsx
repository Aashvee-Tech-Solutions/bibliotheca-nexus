import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft, Star, IndianRupee, Calendar, User, Globe, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Book {
  id: string;
  title: string;
  author_name: string;
  genre: string;
  description: string;
  cover_image_url: string;
  price: number;
  pages: number;
  publication_date: string;
  language: string;
  isbn: string;
  slug: string;
}

const BookDetail = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBookBySlug(slug);
    }
  }, [slug]);

  const fetchBookBySlug = async (bookSlug: string) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('slug', bookSlug)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "Book Not Found",
            description: "The book you're looking for doesn't exist or may have been removed.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      setBook(data);
    } catch (error) {
      console.error('Error fetching book:', error);
      toast({
        title: "Error",
        description: "Failed to load book details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
            <p className="text-muted-foreground mb-4">The book you're looking for doesn't exist.</p>
            <Link to="/books">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Books
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/books" className="hover:text-foreground">Books</Link>
          <span>/</span>
          <span className="text-foreground">{book.title}</span>
        </nav>
      </div>

      {/* Book Details */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Book Cover */}
          <div className="space-y-4">
            <div className="aspect-[3/4] max-w-md mx-auto lg:mx-0">
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
            </div>
            
            {/* Share & Download */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.share?.({
                    title: book.title,
                    text: `Check out this book: ${book.title} by ${book.author_name}`,
                    url: window.location.href
                  }) || navigator.clipboard.writeText(window.location.href);
                  toast({ title: "Link copied to clipboard!" });
                }}
              >
                <Globe className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Preview
              </Button>
            </div>
          </div>

          {/* Book Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{book.genre}</Badge>
                <Badge variant="outline">{book.language}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{book.title}</h1>
              <div className="flex items-center text-lg text-muted-foreground mb-4">
                <User className="w-4 h-4 mr-1" />
                by {book.author_name}
              </div>
              
              {book.price && (
                <div className="flex items-center text-2xl font-bold text-primary mb-4">
                  <IndianRupee className="w-6 h-6" />
                  {book.price.toLocaleString()}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold mb-3">About This Book</h3>
              <p className="text-muted-foreground leading-relaxed">
                {book.description || "A comprehensive and insightful publication that contributes valuable knowledge to its field."}
              </p>
            </div>

            {/* Book Details */}
            <Card>
              <CardHeader>
                <CardTitle>Book Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {book.pages && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pages:</span>
                    <span>{book.pages}</span>
                  </div>
                )}
                {book.publication_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published:</span>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(book.publication_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language:</span>
                  <span>{book.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Genre:</span>
                  <span>{book.genre}</span>
                </div>
                {book.isbn && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ISBN:</span>
                    <span className="font-mono text-sm">{book.isbn}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-1">
                <Download className="w-5 h-5 mr-2" />
                Purchase & Download
              </Button>
              <Button size="lg" variant="outline" className="flex-1">
                Add to Wishlist
              </Button>
            </div>

            {/* Contact for Bulk Orders */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Bulk Orders & Institutional Sales</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Special pricing available for educational institutions and bulk purchases.
                </p>
                <Link to="/contact">
                  <Button variant="outline" size="sm">
                    Contact for Pricing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Books Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">More Books in {book.genre}</h2>
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3" />
            <p>Related books will be displayed here</p>
            <Link to="/books" className="mt-4 inline-block">
              <Button variant="outline">Browse All Books</Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookDetail;