import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Award, Users } from "lucide-react";
import { useState } from "react";

const Authors = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const authors = [
    {
      id: 1,
      name: "Dr. Yalla Venkate",
      image: "/lovable-uploads/182c0880-bdc5-4a54-8faf-051738d3b81f.png", // Author profile from the uploaded image
      title: "Dean of Research & Development",
      affiliation: "Srinivasa Institute of Engineering and Technology",
      specialization: ["Artificial Intelligence", "Machine Learning", "IoT"],
      bio: "Dr. Yalla Venkat is currently serving as Dean of Research & Development and Dean & Professor of Artificial Intelligence & Machine Learning at Srinivasa Institute of Engineering and Technology (Autonomous). Previously, Dr. Venkat was a Professor of Computer Science Engineering at BVC College of Engineering, Palacharla, Rajanagaram Mandal. E.G.Dt, Andhrapradesh, where he cultivated over 28 years of solid professional teaching and research experience in reputed engineering colleges.",
      booksPublished: 5,
      citationIndex: "h-index: 4.2",
      achievements: [
        "Best Teaching Award from Global Teaching Excellence",
        "Research Excellence Award from Institute of Scholars",
        "Life Time Achievement Award from Novel Research Academy"
      ]
    },
    {
      id: 2,
      name: "Arunkumar Beyyala",
      image: "/lovable-uploads/182c0880-bdc5-4a54-8faf-051738d3b81f.png", // Using same reference image
      title: "Associate Professor",
      affiliation: "Srinivasa Institute of Engineering and Technology",
      specialization: ["Computer Science", "Image Processing", "Neural Networks"],
      bio: "Mr. Arunkumar Beyyala is a distinguished academic and professional in the field of Computer Science and Engineering, currently serving as the Head - Training and Placement Officer and Associate Professor at Srinivasa Institute of Engineering and Technology (Autonomous). He has completed Master of Technologies in Computer Science and Engineering from Acharya Nagarjuna University, Guntur and Bachelor of Technology in Computer Science and Engineering from SCSVMV, Kanchipuram.",
      booksPublished: 3,
      citationIndex: "h-index: 4.0, Citations: 107",
      achievements: [
        "15+ years of teaching experience",
        "Guided 15+ B.Tech and M.Tech projects",
        "Expert in software project management"
      ]
    },
    {
      id: 3,
      name: "V Saipriya",
      image: "/lovable-uploads/182c0880-bdc5-4a54-8faf-051738d3b81f.png", // Using same reference image
      title: "Associate Professor & HOD-CSE",
      affiliation: "Srinivasa Institute of Engineering and Technology",
      specialization: ["Computer Science", "Wireless Sensor Networks", "Machine Learning"],
      bio: "Mrs. Saipriya Vissapragada is currently working as Associate Professor and HOD-CSE at Srinivasa Institute of Engineering and Technology. She has completed Master of Technologies in Computer Science and Engineering from Acharya Nagarjuna University, Guntur and Bachelor of Technology in Computer Science and Information Technology from JNTUH, Hyderabad.",
      booksPublished: 4,
      citationIndex: "15+ publications",
      achievements: [
        "15+ years of academic experience",
        "25+ B.tech and M.Tech project guidance",
        "Strong foundation in theoretical and practical computing"
      ]
    },
    {
      id: 4,
      name: "Surendranath Kalagara",
      image: "/lovable-uploads/cf8237d9-c9b6-4db0-8b8f-ba51d5c2d781.png", // Author profile from second book
      title: "Assistant Professor",
      affiliation: "BVC College of Engineering",
      specialization: ["Computer Science", "Cloud Computing", "Java Programming"],
      bio: "Surendranath Kalagara is an accomplished educator and researcher with a strong background in Computer Science and Engineering. Holding both an M.Tech and a B.Tech in the field, Surendranath has dedicated his career to teaching, currently serving as an Assistant Professor at BVC College of Engineering.",
      booksPublished: 2,
      citationIndex: "Emerging researcher",
      achievements: [
        "Faculty development programs participation",
        "Expertise in emerging technologies",
        "Passion for learning and teaching"
      ]
    },
    {
      id: 5,
      name: "P Hemanth Raj Vardhan",
      image: "/lovable-uploads/cf8237d9-c9b6-4db0-8b8f-ba51d5c2d781.png", // Author profile from second book
      title: "Cybersecurity Specialist",
      affiliation: "Independent Researcher",
      specialization: ["Cybersecurity", "Ethical Hacking", "Web Development"],
      bio: "Hemanth Raj Vardhan is a passionate internet creator with a keen interest in hacking. His journey began in 2017 when he decided to delve into the world of cyber security and programming. He started with a blog and gradually ventured into the leading to the creation of apps and websites.",
      booksPublished: 2,
      citationIndex: "Industry practitioner",
      achievements: [
        "CEH certification through ZSec",
        "Startup founder (Bezec platform)",
        "Expertise in multiple programming languages"
      ]
    }
  ];

  const filteredAuthors = authors.filter(author => 
    author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase())) ||
    author.affiliation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-brand-primary/10 to-brand-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Distinguished Authors
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Meet the brilliant minds behind our publications - leading researchers, academics, and industry experts.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search authors, specializations, or affiliations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              {filteredAuthors.length} author{filteredAuthors.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-brand-primary mb-2">200+</div>
              <div className="text-muted-foreground">Expert Authors</div>
            </div>
            <div>
              <div className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-brand-primary mb-2">500+</div>
              <div className="text-muted-foreground">Publications</div>
            </div>
            <div>
              <div className="w-16 h-16 bg-brand-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-brand-primary mb-2">50+</div>
              <div className="text-muted-foreground">Awards & Recognition</div>
            </div>
          </div>
        </div>
      </section>

      {/* Authors Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredAuthors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No authors found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAuthors.map((author) => (
                <Card key={author.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="text-center pb-4">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-brand-primary/20">
                      <img 
                        src={author.image} 
                        alt={author.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <CardTitle className="text-xl">{author.name}</CardTitle>
                    <CardDescription className="text-sm font-medium text-brand-primary">
                      {author.title}
                    </CardDescription>
                    <CardDescription className="text-sm">
                      {author.affiliation}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Specializations</h4>
                        <div className="flex flex-wrap gap-1">
                          {author.specialization.map((spec, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {author.bio}
                        </p>
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{author.booksPublished} Books</span>
                        <span>{author.citationIndex}</span>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Key Achievements</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {author.achievements.slice(0, 2).map((achievement, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-1 h-1 bg-brand-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button className="w-full" size="sm">
                        View Profile
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
            Become a Published Author
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Join our distinguished community of authors and share your expertise with the world.
          </p>
          <Button size="lg" variant="secondary">
            Apply to Publish
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Authors;