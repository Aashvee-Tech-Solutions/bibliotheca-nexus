import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Edit, Trash2, Upload, BookOpen, Users, IndianRupee } from "lucide-react";

interface UpcomingBook {
  id?: string;
  title: string;
  genre: string;
  description: string;
  cover_image_url: string;
  total_author_positions: number;
  available_positions: number;
  price_per_position: number;
  publication_date: string;
  status: string;
  copy_allocation: any;
  position_pricing: any;
  purchased_positions?: any[];
}

const defaultPricingStructure = {
  "1": { 
    price: 16000, 
    copies: 2, 
    positions: [{ position: 1, price: 16000 }] 
  },
  "2": { 
    price_structure: [10000, 9000], 
    copies: 4, 
    positions: [
      { position: 1, price: 10000 }, 
      { position: 2, price: 9000 }
    ] 
  },
  "3": { 
    price_structure: [8000, 7000, 6000], 
    copies: 6, 
    positions: [
      { position: 1, price: 8000 }, 
      { position: 2, price: 7000 }, 
      { position: 3, price: 6000 }
    ] 
  },
  "4": { 
    price_structure: [7000, 6000, 5000, 4000], 
    copies: 8, 
    positions: [
      { position: 1, price: 7000 }, 
      { position: 2, price: 6000 }, 
      { position: 3, price: 5000 }, 
      { position: 4, price: 4000 }
    ] 
  }
};

export const UpcomingBooksManager = () => {
  const { toast } = useToast();
  const [books, setBooks] = useState<UpcomingBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<UpcomingBook | null>(null);
  const [newBook, setNewBook] = useState<UpcomingBook>({
    title: "",
    genre: "",
    description: "",
    cover_image_url: "",
    total_author_positions: 1,
    available_positions: 1,
    price_per_position: 5000,
    publication_date: "",
    status: "active",
    copy_allocation: defaultPricingStructure,
    position_pricing: [{ position: 1, price: 5000 }]
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('upcoming_books')
        .select(`
          *,
          authorship_purchases (
            id,
            user_id,
            positions_purchased,
            payment_status,
            total_amount,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process the data to include purchased positions
      const booksWithPurchases = (data || []).map(book => ({
        ...book,
        purchased_positions: book.authorship_purchases || []
      }));
      
      setBooks(booksWithPurchases);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('covers')
        .getPublicUrl(filePath);

      const imageUrl = data.publicUrl;
      
      if (editingBook) {
        setEditingBook({ ...editingBook, cover_image_url: imageUrl });
      } else {
        setNewBook({ ...newBook, cover_image_url: imageUrl });
      }

      toast({
        title: "Success",
        description: "Cover image uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePositionChange = (positions: number, book: UpcomingBook) => {
    const pricing = book.copy_allocation[positions.toString()];
    if (pricing) {
      const price = pricing.price || pricing.price_structure[0];
      const positionPricing = pricing.positions || [];
      
      if (editingBook) {
        setEditingBook({
          ...editingBook,
          total_author_positions: positions,
          available_positions: positions,
          price_per_position: price,
          position_pricing: positionPricing
        });
      } else {
        setNewBook({
          ...newBook,
          total_author_positions: positions,
          available_positions: positions,
          price_per_position: price,
          position_pricing: positionPricing
        });
      }
    }
  };

  const handleSaveBook = async () => {
    const bookData = editingBook || newBook;
    
    // Comprehensive validation
    if (!bookData.title?.trim()) {
      toast({
        title: "Validation Error",
        description: "Book title is required",
        variant: "destructive"
      });
      return;
    }

    if (!bookData.genre?.trim()) {
      toast({
        title: "Validation Error",
        description: "Genre is required",
        variant: "destructive"
      });
      return;
    }

    if (bookData.total_author_positions < 1 || bookData.total_author_positions > 10) {
      toast({
        title: "Validation Error",
        description: "Author positions must be between 1 and 10",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare data for save, ensuring proper format
      const saveData = {
        title: bookData.title.trim(),
        genre: bookData.genre.trim(),
        description: bookData.description?.trim() || '',
        cover_image_url: bookData.cover_image_url || '',
        total_author_positions: bookData.total_author_positions,
        available_positions: bookData.available_positions,
        price_per_position: bookData.price_per_position,
        publication_date: bookData.publication_date || null,
        status: bookData.status || 'active',
        position_pricing: JSON.stringify(bookData.position_pricing || []),
        copy_allocation: JSON.stringify(bookData.copy_allocation || defaultPricingStructure)
      };

      let result;
      if (editingBook?.id) {
        result = await supabase
          .from('upcoming_books')
          .update(saveData)
          .eq('id', editingBook.id)
          .select();
      } else {
        result = await supabase
          .from('upcoming_books')
          .insert([saveData])
          .select();
      }

      if (result.error) {
        console.error('Database error:', result.error);
        throw new Error(result.error.message || 'Database operation failed');
      }

      toast({
        title: "Success",
        description: `Book ${editingBook ? 'updated' : 'created'} successfully`
      });

      setIsDialogOpen(false);
      setEditingBook(null);
      setNewBook({
        title: "",
        genre: "",
        description: "",
        cover_image_url: "",
        total_author_positions: 1,
        available_positions: 1,
        price_per_position: 5000,
        publication_date: "",
        status: "active",
        copy_allocation: defaultPricingStructure,
        position_pricing: [{ position: 1, price: 5000 }]
      });
      await fetchBooks();
    } catch (error: any) {
      console.error('Error saving book:', error);
      toast({
        title: "Save Error",
        description: error.message || "Failed to save book. Please check your inputs and try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    // Use window.confirm for better browser compatibility
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      // First check if there are any purchases for this book
      const { data: purchases, error: purchaseError } = await supabase
        .from('authorship_purchases')
        .select('id, payment_status')
        .eq('upcoming_book_id', bookId);

      if (purchaseError) {
        console.error('Error checking purchases:', purchaseError);
        throw new Error('Failed to check existing purchases');
      }

      // Check for completed purchases
      const completedPurchases = purchases?.filter(p => p.payment_status === 'completed') || [];
      
      if (completedPurchases.length > 0) {
        toast({
          title: "Cannot Delete",
          description: `This book has ${completedPurchases.length} completed purchase(s) and cannot be deleted.`,
          variant: "destructive"
        });
        return;
      }

      // If there are pending purchases, ask for confirmation
      const pendingPurchases = purchases?.filter(p => p.payment_status === 'pending') || [];
      if (pendingPurchases.length > 0) {
        const confirmDelete = window.confirm(
          `This book has ${pendingPurchases.length} pending purchase(s). Delete anyway?`
        );
        if (!confirmDelete) return;
      }

      const { error } = await supabase
        .from('upcoming_books')
        .delete()
        .eq('id', bookId);

      if (error) {
        console.error('Delete error:', error);
        throw new Error(error.message || 'Failed to delete book');
      }

      toast({
        title: "Success",
        description: "Book deleted successfully"
      });
      fetchBooks();
    } catch (error: any) {
      console.error('Error deleting book:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete book. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (book: UpcomingBook) => {
    setEditingBook(book);
    setIsDialogOpen(true);
  };

  const currentBook = editingBook || newBook;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Upcoming Books Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingBook(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Book
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={currentBook.title}
                  onChange={(e) => editingBook 
                    ? setEditingBook({...editingBook, title: e.target.value})
                    : setNewBook({...newBook, title: e.target.value})
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre *</Label>
                <Select
                  value={currentBook.genre}
                  onValueChange={(value) => editingBook
                    ? setEditingBook({...editingBook, genre: value})
                    : setNewBook({...newBook, genre: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fiction">Fiction</SelectItem>
                    <SelectItem value="Non-Fiction">Non-Fiction</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Self-Help">Self-Help</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={currentBook.description}
                  onChange={(e) => editingBook
                    ? setEditingBook({...editingBook, description: e.target.value})
                    : setNewBook({...newBook, description: e.target.value})
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="positions">Number of Author Positions</Label>
                <Input
                  id="positions"
                  type="number"
                  min="1"
                  max="10"
                  value={currentBook.total_author_positions}
                  onChange={(e) => {
                    const positions = parseInt(e.target.value) || 1;
                    const newPositions = Array.from({ length: positions }, (_, i) => ({
                      position: i + 1,
                      price: 5000 // Default price
                    }));
                    
                    if (editingBook) {
                      setEditingBook({
                        ...editingBook,
                        total_author_positions: positions,
                        available_positions: positions,
                        position_pricing: newPositions,
                        price_per_position: newPositions[0]?.price || 5000
                      });
                    } else {
                      setNewBook({
                        ...newBook,
                        total_author_positions: positions,
                        available_positions: positions,
                        position_pricing: newPositions,
                        price_per_position: newPositions[0]?.price || 5000
                      });
                    }
                  }}
                  placeholder="Enter number of positions"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copies">Total Book Copies</Label>
                <Input
                  id="copies"
                  type="number"
                  min="1"
                  value={currentBook.total_author_positions * 2}
                  onChange={(e) => {
                    // Read-only calculated field based on positions
                  }}
                  placeholder="Auto-calculated (2 copies per position)"
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Automatically calculated: {currentBook.total_author_positions} positions × 2 copies = {currentBook.total_author_positions * 2} total copies
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="publication_date">Publication Date</Label>
                <Input
                  id="publication_date"
                  type="date"
                  value={currentBook.publication_date}
                  onChange={(e) => editingBook
                    ? setEditingBook({...editingBook, publication_date: e.target.value})
                    : setNewBook({...newBook, publication_date: e.target.value})
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={currentBook.status}
                  onValueChange={(value) => editingBook
                    ? setEditingBook({...editingBook, status: value})
                    : setNewBook({...newBook, status: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="sold_out">Sold Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Position-wise custom pricing */}
              <div className="col-span-2 space-y-4">
                <Label className="text-base font-semibold">Position-Specific Pricing</Label>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {currentBook.position_pricing?.map((pos: any, idx: number) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center space-x-2">
                        <Label className="min-w-[70px] font-medium">Position {pos.position}:</Label>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm">₹</span>
                          <Input
                            type="number"
                            value={pos.price}
                            onChange={(e) => {
                              const newPricing = [...(currentBook.position_pricing || [])];
                              newPricing[idx].price = parseFloat(e.target.value) || 0;
                              
                              // Update the base price_per_position to the first position's price
                              const basePrice = newPricing[0]?.price || 0;
                              
                              if (editingBook) {
                                setEditingBook({
                                  ...editingBook, 
                                  position_pricing: newPricing,
                                  price_per_position: basePrice
                                });
                              } else {
                                setNewBook({
                                  ...newBook, 
                                  position_pricing: newPricing,
                                  price_per_position: basePrice
                                });
                              }
                            }}
                            placeholder="Enter price"
                            className="w-24"
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="flex-1 text-xs text-muted-foreground">
                        2 copies included
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                  💡 Tip: Set different prices for each position. Position 1 is typically the highest priced.
                </div>
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="cover">Cover Image</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                </div>
                {currentBook.cover_image_url && (
                  <div className="mt-2">
                    <img 
                      src={currentBook.cover_image_url} 
                      alt="Cover preview" 
                      className="w-32 h-40 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBook}>
                <Save className="w-4 h-4 mr-2" />
                {editingBook ? 'Update' : 'Create'} Book
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading books...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              <div className="aspect-[3/4] relative">
                {book.cover_image_url ? (
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={book.status === 'active' ? 'default' : 'secondary'}>
                    {book.status}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                <CardDescription>{book.genre}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {book.available_positions}/{book.total_author_positions}
                    </div>
                    <div className="flex items-center font-semibold">
                      <IndianRupee className="w-4 h-4" />
                      {book.price_per_position.toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Show position-wise pricing */}
                  {(book.position_pricing || book.copy_allocation?.[book.total_author_positions.toString()]?.positions) && (
                    <div className="text-xs space-y-1">
                      <div className="font-medium text-muted-foreground">Position Pricing:</div>
                      {(book.position_pricing || book.copy_allocation[book.total_author_positions.toString()].positions).map((pos: any, idx: number) => {
                        const isPurchased = book.purchased_positions?.some((purchase: any) => 
                          purchase.payment_status === 'completed' && 
                          purchase.position_purchased === pos.position
                        );
                        return (
                          <div key={idx} className="flex justify-between items-center">
                            <span className={isPurchased ? "line-through text-muted-foreground" : ""}>
                              Position {pos.position}:
                            </span>
                            <span className={`font-semibold ${isPurchased ? "line-through text-muted-foreground" : "text-primary"}`}>
                              ₹{pos.price.toLocaleString()}
                            </span>
                            {isPurchased && (
                              <Badge variant="secondary" className="text-xs ml-2">Sold</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(book)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteBook(book.id!)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};