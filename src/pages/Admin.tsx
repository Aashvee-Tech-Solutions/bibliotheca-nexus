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
  Settings
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");

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
    }
  ]);

  const [newBook, setNewBook] = useState({
    title: "",
    authors: "",
    category: "",
    description: "",
    price: "",
    isbn: "",
    status: "Draft"
  });

  const [newAuthor, setNewAuthor] = useState({
    name: "",
    email: "",
    bio: "",
    specialization: "",
    affiliation: ""
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
      status: "Draft"
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
      affiliation: ""
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Admin Header */}
      <section className="py-8 bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="opacity-90">Manage books, authors, and publishing operations</p>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span className="text-sm">Administrator</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="authors">Authors</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-brand-primary">{stats.totalBooks}</div>
                  <p className="text-xs text-muted-foreground">Active publications</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Authors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-brand-primary">{stats.totalAuthors}</div>
                  <p className="text-xs text-muted-foreground">Published authors</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-brand-primary">{stats.totalSales}</div>
                  <p className="text-xs text-muted-foreground">Books sold</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-brand-primary">₹{stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total earnings</p>
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