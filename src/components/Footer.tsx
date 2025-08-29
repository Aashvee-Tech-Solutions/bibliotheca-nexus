import { Link } from "react-router-dom";
import { BookOpen, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/002c1556-cc44-4069-aae1-86335d66c709.png" 
                alt="AASHVEE Publishers Logo" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted partner in academic and professional publishing. 
              Bringing quality research and knowledge to the world.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>info@aashveetech.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/books" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Our Books
                </Link>
              </li>
              <li>
                <Link to="/authors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Authors
                </Link>
              </li>
              <li>
                <Link to="/upcoming-books" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Upcoming Books
                </Link>
              </li>
              <li>
                <Link to="/packages" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Publishing Packages
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/submit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Submit Manuscript
                </Link>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Editorial Services</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Design & Layout</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Distribution</span>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Legal & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>+91 6281614117</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 AASHVEE Publishers. All rights reserved.
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Hyderabad, Telangana, India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
