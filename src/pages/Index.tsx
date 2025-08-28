import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-wellness.jpg";
import { Heart, Brain, MessageCircle, Wind, Quote, BarChart3, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/90"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Your Journey to{" "}
            <span className="text-gradient">Mental Wellness</span>{" "}
            Starts Here
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up">
            Discover peace of mind with personalized mood tracking, AI-powered conversations, and mindful practices designed for your wellbeing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link to={user ? "/dashboard" : "/signup"}>
              <Button size="lg" className="wellness-button-primary text-lg px-8 py-4">
                {user ? "Go to Dashboard" : "Start Your Wellness Journey"}
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for{" "}
              <span className="text-gradient">Mental Wellness</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed to support your emotional health and mindful living.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Mood Tracking */}
            <Link to="/dashboard">
              <Card className="wellness-card group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-float">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Mood Tracking</h3>
                  <p className="text-muted-foreground">
                    Monitor your emotional patterns with simple, intuitive tracking tools.
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Journaling */}
            <Link to="/dashboard">
              <Card className="wellness-card group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-wellness rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-float">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Digital Journaling</h3>
                  <p className="text-muted-foreground">
                    Express your thoughts and feelings in a safe, private space.
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* AI Chat */}
            <Link to="/chat">
              <Card className="wellness-card group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-float">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">AI Companion</h3>
                  <p className="text-muted-foreground">
                    Chat with an empathetic AI trained to support your mental health.
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Breathing Exercises */}
            <Link to="/breathing">
              <Card className="wellness-card group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-wellness-blue rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-float">
                    <Wind className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Breathing Exercises</h3>
                  <p className="text-muted-foreground">
                    Guided breathing techniques to reduce stress and anxiety.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Track Your Progress,{" "}
                <span className="text-gradient">Celebrate Growth</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Watch your wellness journey unfold with detailed insights, progress charts, and personalized recommendations that adapt to your unique needs.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-6 w-6 text-primary flex-shrink-0" />
                  <span>Visual progress tracking and analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Quote className="h-6 w-6 text-primary flex-shrink-0" />
                  <span>Daily motivational quotes and insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-6 w-6 text-primary flex-shrink-0" />
                  <span>Personalized wellness recommendations</span>
                </div>
              </div>
              <Link to="/progress" className="inline-block mt-8">
                <Button className="wellness-button-primary">
                  View Sample Progress
                </Button>
              </Link>
            </div>
            <div className="bg-gradient-secondary rounded-2xl p-8 wellness-card">
              <div className="bg-card rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-2">This Week's Insights</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mood Average</span>
                    <span className="font-medium text-wellness-green">8.2/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Journal Entries</span>
                    <span className="font-medium">5 this week</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Meditation Sessions</span>
                    <span className="font-medium">12 minutes avg</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full mb-4">
                  <span className="text-2xl font-bold text-white">↗</span>
                </div>
                <p className="text-lg font-medium">You're on an upward trend!</p>
                <p className="text-sm text-muted-foreground">Keep up the great work</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by{" "}
              <span className="text-gradient">Wellness Seekers</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands who've found peace of mind with MindFresh
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="wellness-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "MindFresh has become my daily companion. The mood tracking helps me understand my patterns, and the AI chat is incredibly supportive."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">S</span>
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">Wellness Enthusiast</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="wellness-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The breathing exercises are perfect for my anxiety. I love how the app guides me through each session with beautiful animations."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-wellness rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">M</span>
                  </div>
                  <div>
                    <p className="font-semibold">Marcus Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Student</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="wellness-card">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "As a therapist, I recommend MindFresh to my clients. It's a wonderful tool for self-reflection and maintaining mental wellness."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">D</span>
                  </div>
                  <div>
                    <p className="font-semibold">Dr. Jennifer Walsh</p>
                    <p className="text-sm text-muted-foreground">Licensed Therapist</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show if user is not logged in */}
      {!user && (
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your{" "}
              <span className="text-gradient">Wellness Journey</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who've found peace of mind with MindFresh. Start your free account today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="wellness-button-primary text-lg px-8 py-4">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
