import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-gradient">MindFresh</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`transition-colors ${
                isActive("/") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`transition-colors ${
                isActive("/dashboard") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/chat"
              className={`transition-colors ${
                isActive("/chat") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              AI Chat
            </Link>
            <Link
              to="/progress"
              className={`transition-colors ${
                isActive("/progress") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Progress
            </Link>
            <Link
              to="/recommendations"
              className={`transition-colors ${
                isActive("/recommendations") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Recommendations
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="wellness-button-primary">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={toggleMenu}
                className={`transition-colors ${
                  isActive("/") ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                onClick={toggleMenu}
                className={`transition-colors ${
                  isActive("/dashboard") ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/chat"
                onClick={toggleMenu}
                className={`transition-colors ${
                  isActive("/chat") ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                AI Chat
              </Link>
              <Link
                to="/progress"
                onClick={toggleMenu}
                className={`transition-colors ${
                  isActive("/progress") ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                Progress
              </Link>
              <Link
                to="/recommendations"
                onClick={toggleMenu}
                className={`transition-colors ${
                  isActive("/recommendations") ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                Recommendations
              </Link>
              
              {/* Mobile Action Buttons */}
              <div className="px-4 py-4 border-t border-border">
                <div className="flex flex-col space-y-3">
                  {user ? (
                    <>
                      <div className="text-center text-sm text-muted-foreground mb-2">
                        Signed in as {user.email}
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full justify-center"
                        onClick={() => {
                          handleSignOut();
                          toggleMenu();
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={toggleMenu}>
                        <Button variant="outline" className="w-full justify-center">
                          <User className="h-4 w-4 mr-2" />
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/signup" onClick={toggleMenu}>
                        <Button className="wellness-button-primary w-full justify-center">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;