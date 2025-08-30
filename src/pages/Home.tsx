import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Award, Zap, Globe, CheckCircle, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Expert Publishing",
      description: "Professional editing, design, and distribution services for academic and technical publications."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Your books reach readers worldwide through our extensive distribution network."
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description: "Rigorous peer review and editorial standards ensure the highest quality publications."
    },
    {
      icon: Zap,
      title: "Fast Track Publishing",
      description: "Streamlined publishing process gets your book to market faster than traditional publishers."
    }
  ];

  const packages = [
    {
      name: "Essential",
      price: "₹25,000",
      description: "Perfect for first-time authors",
      features: [
        "Professional editing",
        "Basic cover design",
        "ISBN assignment",
        "Print-on-demand",
        "Online distribution"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "₹45,000",
      description: "Our most popular package",
      features: [
        "Premium editing & proofreading",
        "Custom cover design",
        "Marketing support",
        "Multiple format publishing",
        "Author website",
        "Review coordination"
      ],
      popular: true
    },
    {
      name: "Premium",
      price: "₹75,000",
      description: "Complete publishing solution",
      features: [
        "Comprehensive editing",
        "Professional photoshoot",
        "Video book trailer",
        "PR & media outreach",
        "International distribution",
        "Dedicated account manager"
      ],
      popular: false
    }
  ];

  const featuredBooks = [
    {
      id: 1,
      title: "Industrial Intelligence: IoT and Machine Learning in the Age of IIoT",
      authors: ["Dr. Yalla Venkate", "Arunkumar Beyyala", "V Saipriya"],
      image: "/lovable-uploads/3815e5af-90e4-4ec8-91f0-ae967ba64457.png",
      category: "Technology",
      rating: 4.8
    },
    {
      id: 2,
      title: "Deep Learning for IoT: From Data to Decision",
      authors: ["Surendranath Kalagara", "P Hemanth Raj Vardhan"],
      image: "/lovable-uploads/0fcb646b-06d4-45cf-8829-38531cd653de.png",
      category: "AI & ML",
      rating: 4.9
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose AASHVEE Publishers?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We combine traditional publishing excellence with modern technology to deliver exceptional results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-r from-brand-primary to-brand-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Publications</h2>
              <p className="text-xl text-muted-foreground">Discover our latest academic and technical publications</p>
            </div>
            <Link to="/books">
              <Button variant="outline">
                View All Books
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {featuredBooks.map((book) => (
              <Card key={book.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="flex">
                  <div className="w-1/3">
                    <img 
                      src={book.image} 
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-2/3 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{book.category}</Badge>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium ml-1">{book.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg mb-3 leading-tight">{book.title}</CardTitle>
                    <div className="text-sm text-muted-foreground mb-4">
                      By {book.authors.join(", ")}
                    </div>
                    <Button size="sm" className="w-full">
                      Learn More
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Publishing Packages */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Publishing Packages
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect package for your publishing journey. All packages include our commitment to quality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.popular ? 'border-brand-primary shadow-lg scale-105' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-brand-primary text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription className="text-base">{pkg.description}</CardDescription>
                  <div className="text-3xl font-bold text-brand-primary mt-4">{pkg.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/packages">
                    <Button 
                      className={`w-full mt-6 ${pkg.popular ? 'bg-brand-primary hover:bg-brand-secondary' : ''}`}
                      variant={pkg.popular ? 'default' : 'outline'}
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Share Your Knowledge?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join hundreds of authors who have trusted AASHVEE Publishers to bring their ideas to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" variant="secondary">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/packages">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-brand-primary">
                View Packages
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
<footer className="bg-foreground text-background py-12">
  <div className="container mx-auto px-4">
    <div className="grid md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src="/lovable-uploads/002c1556-cc44-4069-aae1-86335d66c709.png" 
            alt="AASHVEE Publishers Logo" 
            className="h-12 w-auto"
          />
        </div>
        <p className="text-sm opacity-75">Your Voice, Their Ears</p>
        <p className="text-xs mt-2 opacity-60">
          Aashvee Publishers is the imprint name of Aashvee Tech Solutions Pvt. Ltd.
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Quick Links</h4>
        <ul className="space-y-2 text-sm opacity-75">
          <li><Link to="/books" className="hover:opacity-100">Books</Link></li>
          <li><Link to="/authors" className="hover:opacity-100">Authors</Link></li>
          <li><Link to="/packages" className="hover:opacity-100">Packages</Link></li>
          <li><Link to="/terms" className="hover:opacity-100">Terms & Conditions</Link></li>
          <li><Link to="/privacy" className="hover:opacity-100">Privacy</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Services</h4>
        <ul className="space-y-2 text-sm opacity-75">
          <li>Academic Publishing</li>
          <li>Technical Publications</li>
          <li>Editorial Services</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Contact</h4>
        <ul className="space-y-2 text-sm opacity-75">
          <li>info@aashveepublisher.com</li>
          <li>www.aashveepublisher.com</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm opacity-75">
      <p>&copy; 2024 AASHVEE Publishers. All rights reserved.</p>
    </div>
  </div>
</footer>

    </div>
  );
};

export default Home;
