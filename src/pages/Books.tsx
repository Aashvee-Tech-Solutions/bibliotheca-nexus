import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight, Star, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Publications</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Discover our collection of high-quality academic and professional publications
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/submit">
              <Button size="lg" variant="secondary">
                Submit Your Manuscript
              </Button>
            </Link>
            <Link to="/upcoming-books">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-brand-primary">
                View Upcoming Books
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Available Books</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse our collection of published books across various academic and professional fields
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading books...</div>
          ) : books.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <Card key={book.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="aspect-[3/4] overflow-hidden">
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
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{book.genre}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                    <CardTitle className="text-lg mb-2 leading-tight line-clamp-2">{book.title}</CardTitle>
                    <div className="text-sm text-muted-foreground mb-3">
                      By {book.author_name}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {book.description || "A comprehensive publication covering important topics in the field."}
                    </p>
                    {book.price && (
                      <div className="flex items-center text-lg font-bold text-brand-primary mb-4">
                        <IndianRupee className="w-4 h-4" />
                        {book.price.toLocaleString()}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Link to={`/book/${book.slug || book.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          // Create a direct purchase for regular books
                          const purchaseData = {
                            bookId: book.id,
                            title: book.title,
                            price: book.price,
                            type: 'book_purchase'
                          };
                          const encodedData = encodeURIComponent(JSON.stringify(purchaseData));
                          window.location.href = `/purchase-book?data=${encodedData}`;
                        }}
                      >
                        Buy Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Books Found</h3>
              <p className="text-muted-foreground">Check back soon for new publications!</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Share Your Knowledge?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join hundreds of authors who have trusted AASHVEE Publishers to bring their ideas to life.
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary">
              Start Publishing
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Books;