import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Filter } from "lucide-react";
import { useState } from "react";

const Books = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const books = [
    {
      id: 1,
      title: "Industrial Intelligence: IoT and Machine Learning in the Age of IIoT",
      authors: ["Dr. Yalla Venkate", "Arunkumar Beyyala", "V Saipriya"],
      image: "/lovable-uploads/3815e5af-90e4-4ec8-91f0-ae967ba64457.png",
      category: "Technology",
      rating: 4.8,
      description: "A comprehensive guide to Industrial Intelligence, exploring IoT and Machine Learning applications in modern industrial settings.",
      price: "₹650",
      isbn: "978-81-973291-1-1"
    },
    {
      id: 2,
      title: "Deep Learning for IoT: From Data to Decision",
      authors: ["Surendranath Kalagara", "P Hemanth Raj Vardhan"],
      image: "/lovable-uploads/0fcb646b-06d4-45cf-8829-38531cd653de.png",
      category: "AI & ML",
      rating: 4.9,
      description: "An in-depth exploration of deep learning techniques applied to IoT systems, covering data processing to decision-making.",
      price: "₹950",
      isbn: "978-81-973291-2-2"
    }
  ];

  const categories = ["all", "Technology", "AI & ML", "Engineering", "Computer Science"];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-brand-primary/10 to-brand-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Publications
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover cutting-edge research and knowledge from leading experts in technology and engineering.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search books or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No books found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img 
                      src={book.image} 
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{book.category}</Badge>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium ml-1">{book.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {book.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      By {book.authors.join(", ")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {book.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-bold text-brand-primary">{book.price}</div>
                      <div className="text-xs text-muted-foreground">ISBN: {book.isbn}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Want to Publish Your Book?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Join our growing list of published authors and share your knowledge with the world.
          </p>
          <Button size="lg" variant="secondary">
            Start Publishing
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Books;