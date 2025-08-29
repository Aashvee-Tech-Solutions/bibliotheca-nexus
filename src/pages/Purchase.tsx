import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Users, IndianRupee, BookOpen, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
}

interface PurchaseData {
  positions: number;
  phoneNumber: string;
  bio: string;
  profileImage: File | null;
}

const Purchase = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [book, setBook] = useState<UpcomingBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseData, setPurchaseData] = useState<PurchaseData>({
    positions: 1,
    phoneNumber: '',
    bio: '',
    profileImage: null
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (bookId) {
      fetchBookDetails();
    }
  }, [bookId, user, navigate]);

  const fetchBookDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('upcoming_books')
        .select('*')
        .eq('id', bookId)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      setBook(data);
    } catch (error) {
      console.error('Error fetching book details:', error);
      toast({
        title: "Error",
        description: "Failed to load book details",
        variant: "destructive"
      });
      navigate('/upcoming-books');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPurchaseData(prev => ({ ...prev, profileImage: file }));
    }
  };

  const uploadProfileImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handlePurchase = async () => {
    if (!book || !user) return;

    setPurchasing(true);
    try {
      // Upload profile image if provided
      let profileImageUrl = null;
      if (purchaseData.profileImage) {
        profileImageUrl = await uploadProfileImage(purchaseData.profileImage);
      }

      // Calculate total amount
      const totalAmount = book.price_per_position * purchaseData.positions;

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('authorship_purchases')
        .insert({
          upcoming_book_id: book.id,
          user_id: user.id,
          positions_purchased: purchaseData.positions,
          total_amount: totalAmount,
          phone_number: purchaseData.phoneNumber,
          bio: purchaseData.bio,
          profile_image_url: profileImageUrl,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Simulate payment processing (replace with actual PhonePe integration)
      const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Update purchase with payment ID and mark as completed
      const { error: updateError } = await supabase
        .from('authorship_purchases')
        .update({
          payment_id: paymentId,
          payment_status: 'completed'
        })
        .eq('id', purchase.id);

      if (updateError) throw updateError;

      toast({
        title: "Purchase Successful!",
        description: `You have successfully purchased ${purchaseData.positions} authorship position(s).`
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading book details...</div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Book not found</div>
        </div>
      </div>
    );
  }

  const totalAmount = book.price_per_position * purchaseData.positions;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Purchase Authorship Position</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Book Details */}
            <Card>
              <CardHeader>
                <CardTitle>Book Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
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
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">{book.title}</h3>
                  <Badge variant="outline" className="mb-2">{book.genre}</Badge>
                  <p className="text-sm text-muted-foreground">{book.description}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-1" />
                      Available Positions
                    </div>
                    <span className="font-medium">{book.available_positions}/{book.total_author_positions}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      Price per Position
                    </div>
                    <span className="font-medium">₹{book.price_per_position.toLocaleString()}</span>
                  </div>
                  
                  {book.publication_date && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarDays className="w-4 h-4 mr-1" />
                        Publication Date
                      </div>
                      <span className="font-medium">{new Date(book.publication_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Purchase Form */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Details</CardTitle>
                <CardDescription>
                  Complete your information to secure your authorship position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="positions">Number of Positions</Label>
                  <Input
                    id="positions"
                    type="number"
                    min="1"
                    max={book.available_positions}
                    value={purchaseData.positions}
                    onChange={(e) => setPurchaseData(prev => ({
                      ...prev,
                      positions: Math.max(1, Math.min(book.available_positions, parseInt(e.target.value) || 1))
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={purchaseData.phoneNumber}
                    onChange={(e) => setPurchaseData(prev => ({
                      ...prev,
                      phoneNumber: e.target.value
                    }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Professional Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Briefly describe your professional background and expertise..."
                    value={purchaseData.bio}
                    onChange={(e) => setPurchaseData(prev => ({
                      ...prev,
                      bio: e.target.value
                    }))}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="profileImage">Profile Image (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('profileImage')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                    {purchaseData.profileImage && (
                      <span className="text-sm text-muted-foreground">
                        {purchaseData.profileImage.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="flex items-center">
                      <IndianRupee className="w-5 h-5" />
                      {totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!purchaseData.phoneNumber || purchasing || book.available_positions < purchaseData.positions}
                  onClick={handlePurchase}
                >
                  {purchasing ? "Processing..." : `Pay ₹${totalAmount.toLocaleString()}`}
                </Button>

                <p className="text-xs text-muted-foreground">
                  By proceeding with payment, you agree to our{" "}
                  <a href="/terms" className="underline">Terms and Conditions</a>{" "}
                  and <a href="/privacy" className="underline">Privacy Policy</a>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchase;