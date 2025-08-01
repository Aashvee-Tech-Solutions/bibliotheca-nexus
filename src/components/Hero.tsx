import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Award, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-background to-brand-accent/5"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-brand-accent/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-brand-primary/20 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-medium mb-4">
                  Your Voice, Their Ears
                </span>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Transform Your
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent block">
                    Ideas Into Books
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                  AASHVEE Publishers - Where academic excellence meets innovative technology. 
                  We bring your research and knowledge to readers worldwide.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Link to="/packages">
                  <Button size="lg" className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-brand-primary">
                    Publish With Us
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/books">
                  <Button size="lg" variant="outline">
                    Explore Books
                    <BookOpen className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-bold text-brand-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Books Published</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-brand-primary">200+</div>
                  <div className="text-sm text-muted-foreground">Authors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-brand-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
              </div>
            </div>

            {/* Visual Elements */}
            <div className="relative">
              <div className="relative z-10 flex justify-center">
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  {/* Featured Books Preview */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg shadow-lg p-6 border transform rotate-3 hover:rotate-6 transition-transform duration-300">
                      <div className="w-full h-32 bg-gradient-to-br from-brand-primary to-brand-secondary rounded mb-4 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm mb-2">Industrial Intelligence</h3>
                      <p className="text-xs text-muted-foreground">IoT & Machine Learning</p>
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="bg-white rounded-lg shadow-lg p-6 border transform -rotate-3 hover:-rotate-6 transition-transform duration-300">
                      <div className="w-full h-32 bg-gradient-to-br from-brand-accent to-brand-secondary rounded mb-4 flex items-center justify-center">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm mb-2">Deep Learning for IoT</h3>
                      <p className="text-xs text-muted-foreground">Data to Decision</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;