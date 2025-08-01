import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Users, 
  Package, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Upload,
  Save,
  Settings,
  Image
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [manuscripts, setManuscripts] = useState([]);
  const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-primary"></div>
      </div>
    );
  }
  
  // Redirect if not authenticated or not admin
  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  // Fetch manuscripts on component mount
  useEffect(() => {
    fetchManuscripts();
  }, []);

  const fetchManuscripts = async () => {
    try {
      // For now using mock data since the Supabase client might not have proper types
      setManuscripts([]);
    } catch (error) {
      console.error('Error fetching manuscripts:', error);
    }
  };

  // Sample data - in real app this would come from a backend
  const [books, setBooks] = useState([
    {
      id: 1,
      title: "Industrial Intelligence: IoT and Machine Learning in the Age of IIoT",
      authors: ["Dr. Yalla Venkate", "Arunkumar Beyyala", "V Saipriya"],
      category: "Technology",
      status: "Published",
      sales: 450,
      revenue: "₹2,92,500",
      publishDate: "2024-01-15"
    },
    {
      id: 2,
      title: "Deep Learning for IoT: From Data to Decision",
      authors: ["Surendranath Kalagara", "P Hemanth Raj Vardhan"],
      category: "AI & ML",
      status: "Published",
      sales: 320,
      revenue: "₹3,04,000",
      publishDate: "2024-03-20"
    }
  ]);

  const [authors, setAuthors] = useState([
    {
      id: 1,
      name: "Dr. Yalla Venkate",
      email: "yalla.venkat@example.com",
      booksPublished: 5,
      totalSales: 1250,
      status: "Active"
    },
    {
      id: 2,
      name: "Arunkumar Beyyala",
      email: "arun.beyyala@example.com",
      booksPublished: 3,
      totalSales: 890,
      status: "Active"
    },
    {
      id: 3,
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@example.com",
      booksPublished: 2,
      totalSales: 650,
      status: "Active"
    },
    {
      id: 4,
      name: "Prof. Michael Chen",
      email: "michael.chen@example.com",
      booksPublished: 4,
      totalSales: 980,
      status: "Active"
    }
  ]);

  const [newBook, setNewBook] = useState({
    title: "",
    authors: "",
    category: "",
    description: "",
    price: "",
    isbn: "",
    status: "Draft",
    coverImage: ""
  });

  const [newAuthor, setNewAuthor] = useState({
    name: "",
    email: "",
    bio: "",
    specialization: "",
    affiliation: "",
    profileImage: ""
  });

  const stats = {
    totalBooks: books.length,
    totalAuthors: authors.length,
    totalSales: books.reduce((sum, book) => sum + book.sales, 0),
    totalRevenue: books.reduce((sum, book) => sum + parseInt(book.revenue.replace(/[₹,]/g, '')), 0)
  };

  const handleAddBook = () => {
    const book = {
      id: books.length + 1,
      ...newBook,
      authors: newBook.authors.split(',').map(a => a.trim()),
      sales: 0,
      revenue: "₹0",
      publishDate: new Date().toISOString().split('T')[0]
    };
    setBooks([...books, book]);
    setNewBook({
      title: "",
      authors: "",
      category: "",
      description: "",
      price: "",
      isbn: "",
      status: "Draft",
      coverImage: ""
    });
    toast({
      title: "Book Added Successfully",
      description: "The new book has been added to the catalog.",
    });
  };

  const handleAddAuthor = () => {
    const author = {
      id: authors.length + 1,
      ...newAuthor,
      booksPublished: 0,
      totalSales: 0,
      status: "Active"
    };
    setAuthors([...authors, author]);
    setNewAuthor({
      name: "",
      email: "",
      bio: "",
      specialization: "",
      affiliation: "",
      profileImage: ""
    });
    toast({
      title: "Author Added Successfully",
      description: "The new author has been added to the system.",
    });
  };

  const handleDeleteBook = (id: number) => {
    setBooks(books.filter(book => book.id !== id));
    toast({
      title: "Book Deleted",
      description: "The book has been removed from the catalog.",
    });
  };

  const handleDeleteAuthor = (id: number) => {
    setAuthors(authors.filter(author => author.id !== id));
    toast({
      title: "Author Deleted",
      description: "The author has been removed from the system.",
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'book' | 'author') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploadingImage(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from(type === 'book' ? 'covers' : 'avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(type === 'book' ? 'covers' : 'avatars')
        .getPublicUrl(filePath);

      if (type === 'book') {
        setNewBook({...newBook, coverImage: data.publicUrl});
      } else {
        setNewAuthor({...newAuthor, profileImage: data.publicUrl});
      }

      toast({
        title: "Image Uploaded Successfully",
        description: `${type === 'book' ? 'Cover' : 'Profile'} image has been uploaded.`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePlagiarismCheck = async (manuscriptId: string, content: string) => {
    setCheckingPlagiarism(true);
    try {
      const { data, error } = await supabase.functions.invoke('plagiarism-check', {
        body: { manuscriptText: content, manuscriptId }
      });

      if (error) throw error;

      toast({
        title: "Plagiarism Check Completed",
        description: `Plagiarism score: ${data.plagiarismScore?.toFixed(1)}%`,
      });

      // Refresh manuscripts to show updated plagiarism score
      fetchManuscripts();
    } catch (error) {
      toast({
        title: "Plagiarism Check Failed",
        description: "Failed to check plagiarism. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckingPlagiarism(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Admin Header */}
      <section className="py-12 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Admin Control Center
                  </h1>
                  <p className="text-lg opacity-90">Advanced publishing management & analytics</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">System Online</span>
              </div>
              <div className="text-sm opacity-75">Welcome back, Administrator</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-sm rounded-xl p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Overview</TabsTrigger>
            <TabsTrigger value="manuscripts" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Manuscripts</TabsTrigger>
            <TabsTrigger value="books" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Books</TabsTrigger>
            <TabsTrigger value="authors" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Authors</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Enhanced Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Total Books</CardTitle>
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">{stats.totalBooks}</div>
                  <p className="text-xs text-blue-600 mt-1">+2 this month</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Authors</CardTitle>
                  <Users className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">10+</div>
                  <p className="text-xs text-green-600 mt-1">Active publishers</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">Manuscripts</CardTitle>
                  <Package className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">5</div>
                  <p className="text-xs text-purple-600 mt-1">Under review</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">Revenue</CardTitle>
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">₹{stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-orange-600 mt-1">Total earnings</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Books</CardTitle>
                  <CardDescription>Latest published books</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {books.slice(0, 3).map((book) => (
                      <div key={book.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-sm">{book.title}</h4>
                          <p className="text-xs text-muted-foreground">by {book.authors.join(', ')}</p>
                        </div>
                        <Badge variant={book.status === 'Published' ? 'default' : 'secondary'}>
                          {book.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Books</CardTitle>
                  <CardDescription>Books by sales performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {books.sort((a, b) => b.sales - a.sales).slice(0, 3).map((book) => (
                      <div key={book.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-sm">{book.title}</h4>
                          <p className="text-xs text-muted-foreground">{book.sales} copies sold</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{book.revenue}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Manuscripts Tab with Plagiarism Checker */}
          <TabsContent value="manuscripts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manuscripts Management</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Review Queue
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-800">Pending Review</CardTitle>
                  <Eye className="h-5 w-5 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-900">3</div>
                  <p className="text-xs text-yellow-600 mt-1">Awaiting review</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">In Review</CardTitle>
                  <Settings className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">2</div>
                  <p className="text-xs text-blue-600 mt-1">Under review</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Approved</CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">5</div>
                  <p className="text-xs text-green-600 mt-1">Ready to publish</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Manuscript Queue</CardTitle>
                <CardDescription>Review and manage submitted manuscripts with plagiarism detection</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Title</th>
                        <th className="text-left p-4 font-medium">Author</th>
                        <th className="text-left p-4 font-medium">Submitted</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Plagiarism</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-4">
                          <div className="font-medium">Advanced Machine Learning Techniques</div>
                          <div className="text-sm text-muted-foreground">ID: MS001</div>
                        </td>
                        <td className="p-4 text-sm">Dr. Sarah Mitchell</td>
                        <td className="p-4 text-sm">2024-01-15</td>
                        <td className="p-4">
                          <Badge variant="secondary">Pending Review</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              2.3%
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handlePlagiarismCheck('ms001', 'sample manuscript content for plagiarism check')}
                              disabled={checkingPlagiarism}
                            >
                              {checkingPlagiarism ? "Checking..." : "Recheck"}
                            </Button>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                              Approve
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-4">
                          <div className="font-medium">Blockchain in Healthcare</div>
                          <div className="text-sm text-muted-foreground">ID: MS002</div>
                        </td>
                        <td className="p-4 text-sm">Prof. John Davis</td>
                        <td className="p-4 text-sm">2024-01-18</td>
                        <td className="p-4">
                          <Badge variant="default" className="bg-blue-600">In Review</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              5.7%
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handlePlagiarismCheck('ms002', 'sample blockchain manuscript content')}
                              disabled={checkingPlagiarism}
                            >
                              {checkingPlagiarism ? "Checking..." : "Recheck"}
                            </Button>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                              Approve
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Books Tab */}
          <TabsContent value="books" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Books Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Book</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new book publication.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Book Title</Label>
                      <Input
                        id="title"
                        value={newBook.title}
                        onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="authors">Authors (comma separated)</Label>
                      <Input
                        id="authors"
                        value={newBook.authors}
                        onChange={(e) => setNewBook({...newBook, authors: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={newBook.category} onValueChange={(value) => setNewBook({...newBook, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="AI & ML">AI & ML</SelectItem>
                            <SelectItem value="Engineering">Engineering</SelectItem>
                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          value={newBook.price}
                          onChange={(e) => setNewBook({...newBook, price: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        value={newBook.isbn}
                        onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newBook.description}
                        onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coverImage">Cover Image</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="coverImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'book')}
                          disabled={uploadingImage}
                        />
                        {uploadingImage && <span className="text-sm text-muted-foreground">Uploading...</span>}
                      </div>
                      {newBook.coverImage && (
                        <div className="mt-2">
                          <img 
                            src={newBook.coverImage} 
                            alt="Cover preview" 
                            className="w-20 h-28 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={handleAddBook}>
                      <Save className="w-4 h-4 mr-2" />
                      Add Book
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Title</th>
                        <th className="text-left p-4 font-medium">Authors</th>
                        <th className="text-left p-4 font-medium">Category</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Sales</th>
                        <th className="text-left p-4 font-medium">Revenue</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((book) => (
                        <tr key={book.id} className="border-t">
                          <td className="p-4">
                            <div className="font-medium">{book.title}</div>
                            <div className="text-sm text-muted-foreground">ID: {book.id}</div>
                          </td>
                          <td className="p-4 text-sm">{book.authors.join(', ')}</td>
                          <td className="p-4">
                            <Badge variant="secondary">{book.category}</Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant={book.status === 'Published' ? 'default' : 'secondary'}>
                              {book.status}
                            </Badge>
                          </td>
                          <td className="p-4">{book.sales}</td>
                          <td className="p-4 font-medium">{book.revenue}</td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteBook(book.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authors Tab */}
          <TabsContent value="authors" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Authors Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Author
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Author</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new author.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="authorName">Full Name</Label>
                        <Input
                          id="authorName"
                          value={newAuthor.name}
                          onChange={(e) => setNewAuthor({...newAuthor, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="authorEmail">Email</Label>
                        <Input
                          id="authorEmail"
                          type="email"
                          value={newAuthor.email}
                          onChange={(e) => setNewAuthor({...newAuthor, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="affiliation">Affiliation</Label>
                      <Input
                        id="affiliation"
                        value={newAuthor.affiliation}
                        onChange={(e) => setNewAuthor({...newAuthor, affiliation: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={newAuthor.specialization}
                        onChange={(e) => setNewAuthor({...newAuthor, specialization: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={newAuthor.bio}
                        onChange={(e) => setNewAuthor({...newAuthor, bio: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profileImage">Profile Image</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="profileImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'author')}
                          disabled={uploadingImage}
                        />
                        {uploadingImage && <span className="text-sm text-muted-foreground">Uploading...</span>}
                      </div>
                      {newAuthor.profileImage && (
                        <div className="mt-2">
                          <img 
                            src={newAuthor.profileImage} 
                            alt="Profile preview" 
                            className="w-20 h-20 object-cover rounded-full border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={handleAddAuthor}>
                      <Save className="w-4 h-4 mr-2" />
                      Add Author
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Name</th>
                        <th className="text-left p-4 font-medium">Email</th>
                        <th className="text-left p-4 font-medium">Books Published</th>
                        <th className="text-left p-4 font-medium">Total Sales</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {authors.map((author) => (
                        <tr key={author.id} className="border-t">
                          <td className="p-4">
                            <div className="font-medium">{author.name}</div>
                            <div className="text-sm text-muted-foreground">ID: {author.id}</div>
                          </td>
                          <td className="p-4 text-sm">{author.email}</td>
                          <td className="p-4">{author.booksPublished}</td>
                          <td className="p-4">{author.totalSales}</td>
                          <td className="p-4">
                            <Badge variant={author.status === 'Active' ? 'default' : 'secondary'}>
                              {author.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteAuthor(author.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics & Reports</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>Monthly sales performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Sales Chart Placeholder
                    <br />
                    <small>(Would integrate with a charting library)</small>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Revenue by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Revenue Chart Placeholder
                    <br />
                    <small>(Would integrate with a charting library)</small>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Reports</CardTitle>
                <CardDescription>Generate and download reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Upload className="w-6 h-6 mb-2" />
                    Sales Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Upload className="w-6 h-6 mb-2" />
                    Author Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Upload className="w-6 h-6 mb-2" />
                    Revenue Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
