import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Clock, Users, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Packages = () => {
  const packages = [
    {
      id: 1,
      name: "Essential",
      price: "₹25,000",
      originalPrice: "₹35,000",
      description: "Perfect for first-time authors and researchers",
      duration: "4-6 months",
      popular: false,
      features: [
        "Professional editing and proofreading",
        "Basic cover design with 2 concepts",
        "ISBN assignment and registration",
        "Print-on-demand setup",
        "Online distribution (Amazon, Flipkart)",
        "Basic marketing kit",
        "Author consultation sessions (3)",
        "Digital format (PDF, EPUB)",
        "Copyright assistance",
        "Basic website listing"
      ],
      additionalServices: [
        "Expedited publishing (+₹5,000)",
        "Premium cover design (+₹8,000)",
        "Additional author copies (₹200/copy)"
      ]
    },
    {
      id: 2,
      name: "Professional",
      price: "₹45,000",
      originalPrice: "₹60,000",
      description: "Our most comprehensive package for serious authors",
      duration: "3-4 months",
      popular: true,
      features: [
        "Premium editing & comprehensive proofreading",
        "Custom cover design with 5 concepts",
        "ISBN & barcode registration",
        "Multi-format publishing (Print, Digital, Audio-ready)",
        "Extensive distribution network",
        "Professional marketing campaign",
        "Author consultation sessions (6)",
        "Website creation and management",
        "Social media marketing kit",
        "Review coordination and outreach",
        "Book trailer creation",
        "Press release writing and distribution",
        "Author bio and profile optimization",
        "Sales analytics and reporting"
      ],
      additionalServices: [
        "Professional photoshoot (+₹15,000)",
        "Video book trailer (+₹20,000)",
        "International distribution (+₹10,000)"
      ]
    },
    {
      id: 3,
      name: "Premium",
      price: "₹75,000",
      originalPrice: "₹95,000",
      description: "Complete publishing solution with maximum exposure",
      duration: "2-3 months",
      popular: false,
      features: [
        "Comprehensive editorial services",
        "Professional cover design with unlimited revisions",
        "Multiple ISBN registrations",
        "Global distribution network",
        "Full-scale marketing and PR campaign",
        "Author consultation sessions (unlimited)",
        "Professional website with SEO optimization",
        "Complete social media management",
        "Media interviews and podcast appearances",
        "Book launch event coordination",
        "Professional photoshoot and video production",
        "International book fair submissions",
        "Dedicated account manager",
        "Priority customer support",
        "Advanced analytics and market insights"
      ],
      additionalServices: [
        "Celebrity endorsement coordination (+₹25,000)",
        "International awards submission (+₹15,000)",
        "Translation services (+₹30,000)"
      ]
    }
  ];

  const additionalServices = [
    {
      name: "Manuscript Assessment",
      price: "₹5,000",
      description: "Detailed evaluation of your manuscript's potential and marketability"
    },
    {
      name: "Professional Editing",
      price: "₹8,000-15,000",
      description: "Comprehensive editing services based on manuscript length"
    },
    {
      name: "Cover Design Only",
      price: "₹10,000",
      description: "Professional cover design with 3 concepts and unlimited revisions"
    },
    {
      name: "Marketing Campaign",
      price: "₹20,000",
      description: "3-month dedicated marketing campaign for already published books"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Rajesh Kumar",
      role: "Professor, IIT Delhi",
      content: "AASHVEE Publishers transformed my research into a beautifully published book. Their professional approach and attention to detail exceeded my expectations.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "Tech Author",
      content: "The Professional package was perfect for my first book. The marketing support helped me reach readers I never thought possible.",
      rating: 5
    },
    {
      name: "Dr. Anand Patel",
      role: "Research Scientist",
      content: "Excellent service quality and timely delivery. The team understood my vision and brought it to life perfectly.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-brand-primary/10 to-brand-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Publishing Packages
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the perfect package for your publishing journey. All packages include our commitment to quality and professional excellence.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span>Money-back guarantee</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span>Dedicated support</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span>Quality assurance</span>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {packages.map((pkg) => (
              <Card key={pkg.id} className={`relative overflow-hidden ${pkg.popular ? 'border-brand-primary shadow-2xl scale-105 lg:scale-110' : 'hover:shadow-xl'} transition-all duration-300`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-brand-primary text-white px-6 py-2 text-sm font-medium">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6 bg-gradient-to-b from-muted/50 to-background">
                  <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                  <CardDescription className="text-base mb-4">{pkg.description}</CardDescription>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-muted-foreground line-through">{pkg.originalPrice}</span>
                      <Badge variant="destructive">Save ₹{parseInt(pkg.originalPrice.slice(1).replace(',', '')) - parseInt(pkg.price.slice(1).replace(',', ''))}</Badge>
                    </div>
                    <div className="text-4xl font-bold text-brand-primary">{pkg.price}</div>
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      {pkg.duration}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">What's Included:</h4>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Add-on Services:</h4>
                    <ul className="space-y-1">
                      {pkg.additionalServices.map((service, index) => (
                        <li key={index} className="text-xs text-muted-foreground">
                          • {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4">
                    <Link to="/contact">
                      <Button 
                        className={`w-full ${pkg.popular ? 'bg-brand-primary hover:bg-brand-secondary' : ''}`}
                        variant={pkg.popular ? 'default' : 'outline'}
                        size="lg"
                      >
                        Choose This Package
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              À la Carte Services
            </h2>
            <p className="text-lg text-muted-foreground">
              Need specific services? Choose individual offerings to complement your package.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {additionalServices.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <div className="text-2xl font-bold text-brand-primary">{service.price}</div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-4">{service.description}</CardDescription>
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              What Our Authors Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Real experiences from published authors who chose AASHVEE Publishers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's included in the publishing timeline?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Our timeline includes manuscript review, editing, design, printing setup, and distribution. Each package has different timeframes based on the level of service.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you provide international distribution?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Yes, our Professional and Premium packages include international distribution through major online platforms and select bookstores.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I upgrade my package later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Absolutely! You can upgrade your package at any time during the publishing process. We'll adjust the pricing accordingly.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Publishing Journey?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of successful authors who have published with AASHVEE Publishers. 
            Let's bring your book to life and share your knowledge with the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" variant="secondary">
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-brand-primary">
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Packages;