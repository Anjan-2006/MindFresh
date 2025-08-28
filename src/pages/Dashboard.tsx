import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { 
  Heart, 
  Brain, 
  MessageCircle, 
  Wind, 
  Quote, 
  Save,
  Smile,
  Meh,
  Frown,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const [currentMood, setCurrentMood] = useState(7);
  const [journalEntry, setJournalEntry] = useState("");
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("inhale");
  const [breathingStartTime, setBreathingStartTime] = useState<Date | null>(null);
  const [dailyQuote, setDailyQuote] = useState({
    text: "The present moment is the only time over which we have dominion.",
    author: "Thích Nhất Hạnh"
  });
  const [journalCount, setJournalCount] = useState(0);
  const [averageMood, setAverageMood] = useState(0);
  const [meditationTime, setMeditationTime] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const moodEmojis = {
    1: "😢", 2: "😔", 3: "😟", 4: "😐", 5: "🙂",
    6: "😊", 7: "😃", 8: "😄", 9: "😁", 10: "🤩"
  };

  const handleMoodSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('moodTable')
        .insert({
          user_id: user.id,
          mood_value: currentMood,
        });

      if (error) throw error;

      toast({
        title: "Mood Recorded",
        description: `Your mood (${currentMood}/10) has been saved successfully.`,
      });

      // Refresh stats
      fetchUserStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save mood. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJournalSave = async () => {
    if (!user) return;
    
    if (!journalEntry.trim()) {
      toast({
        title: "Empty Entry",
        description: "Please write something before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('journaltable')
        .insert({
          user_id: user.id,
          entry_text: journalEntry.trim(),
        });

      if (error) throw error;
      
      toast({
        title: "Journal Entry Saved",
        description: "Your thoughts have been securely saved.",
      });
      setJournalEntry("");
      
      // Refresh stats
      fetchUserStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startBreathingExercise = () => {
    setIsBreathing(true);
    setBreathingStartTime(new Date());
    let phase = "inhale";
    setBreathingPhase(phase);
    
    const breathingInterval = setInterval(() => {
      phase = phase === "inhale" ? "exhale" : "inhale";
      setBreathingPhase(phase);
    }, 4000);

    setTimeout(() => {
      clearInterval(breathingInterval);
      setIsBreathing(false);
      saveMeditationSession(60); // 60 seconds
      toast({
        title: "Breathing Exercise Complete",
        description: "Great job! You've completed a 1-minute breathing session.",
      });
    }, 60000);
  };

  const stopBreathingExercise = () => {
    if (breathingStartTime) {
      const duration = Math.floor((new Date().getTime() - breathingStartTime.getTime()) / 1000);
      saveMeditationSession(duration);
    }
    setIsBreathing(false);
  };

  const saveMeditationSession = async (duration: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('meditationtime')
        .insert({
          user_id: user.id,
          session_duration: duration,
        });

      if (error) throw error;
      
      // Refresh stats
      fetchUserStats();
    } catch (error) {
      console.error('Failed to save meditation session:', error);
    }
  };

  const fetchDailyQuote = async () => {
    try {
      const response = await fetch('https://api.api-ninjas.com/v1/quotes', {
        headers: {
          'X-Api-Key': import.meta.env.VITE_QUOTES_KEY// You'll need to get this API key
        }
      });
      
      if (response.ok) {
        const quotes = await response.json();
        if (quotes && quotes.length > 0) {
          setDailyQuote({
            text: quotes[0].quote,
            author: quotes[0].author
          });
        }
      }
    } catch (error) {
      // Keep default quote if API fails
      console.error('Failed to fetch quote:', error);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Fetch journal count for this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: journalData, error: journalError } = await supabase
        .from('journaltable')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', weekStart.toISOString());

      if (!journalError) {
        setJournalCount(journalData?.length || 0);
      }

      // Fetch average mood for this month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: moodData, error: moodError } = await supabase
        .from('moodTable')
        .select('mood_value')
        .eq('user_id', user.id)
        .gte('created_at', monthStart.toISOString());

      if (!moodError && moodData && moodData.length > 0) {
        const avg = moodData.reduce((sum, entry) => sum + entry.mood_value, 0) / moodData.length;
        setAverageMood(Number(avg.toFixed(1)));
      }

      // Fetch meditation time for this week
      const { data: meditationData, error: meditationError } = await supabase
        .from('meditationtime')
        .select('session_duration')
        .eq('user_id', user.id)
        .gte('created_at', weekStart.toISOString());

      if (!meditationError && meditationData) {
        const totalSeconds = meditationData.reduce((sum, session) => sum + session.session_duration, 0);
        setMeditationTime(Math.floor(totalSeconds / 60)); // Convert to minutes
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  useEffect(() => {
    fetchDailyQuote();
    if (user) {
      fetchUserStats();
    }
  }, [user]);


  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back to your{" "}
            <span className="text-gradient">wellness journey</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            How are you feeling today? Let's check in with yourself.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Mood Tracker Widget */}
          <Card className="wellness-card xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 text-primary mr-2" />
                Mood Tracker
              </CardTitle>
              <CardDescription>
                How are you feeling right now?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{moodEmojis[currentMood as keyof typeof moodEmojis]}</div>
                <p className="text-2xl font-semibold">{currentMood}/10</p>
              </div>
              
              <div className="space-y-4">
                <div className="px-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentMood}
                    onChange={(e) => setCurrentMood(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>😢</span>
                    <span>🙂</span>
                    <span>🤩</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleMoodSave}
                  className="wellness-button-primary w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Mood
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Journal Widget */}
          <Card className="wellness-card xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-primary mr-2" />
                  Daily Journal
                </div>
                <Link to="/journal-entries">
                  <Button variant="outline" size="sm">
                    View All Entries
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>
                Express your thoughts and feelings in a safe space
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="What's on your mind today? How are you feeling? What are you grateful for?"
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  className="wellness-input min-h-[120px] resize-none"
                />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {journalEntry.length} characters
                  </span>
                  <Button 
                    onClick={handleJournalSave}
                    className="wellness-button-primary"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Entry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breathing Exercise Widget */}
          <Card className="wellness-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wind className="h-5 w-5 text-primary mr-2" />
                Breathing Exercise
              </CardTitle>
              <CardDescription>
                Take a moment to center yourself
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div 
                  className={`w-32 h-32 mx-auto rounded-full bg-gradient-primary flex items-center justify-center transition-all duration-1000 ${
                    isBreathing 
                      ? breathingPhase === "inhale" 
                        ? "scale-110" 
                        : "scale-90"
                      : "scale-100"
                  }`}
                >
                  <Wind className="h-12 w-12 text-white" />
                </div>
                
                {isBreathing && (
                  <div className="text-lg font-medium">
                    {breathingPhase === "inhale" ? "Breathe In..." : "Breathe Out..."}
                  </div>
                )}
                
                <Button
                  onClick={isBreathing ? stopBreathingExercise : startBreathingExercise}
                  className={isBreathing ? "wellness-button-secondary w-full" : "wellness-button-primary w-full"}
                >
                  {isBreathing ? "Stop Exercise" : "Start 1-Min Session"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quote of the Day Widget */}
          <Card className="wellness-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Quote className="h-5 w-5 text-primary mr-2" />
                Daily Inspiration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <blockquote className="text-lg italic text-muted-foreground">
                  "{dailyQuote.text}"
                </blockquote>
                <p className="font-semibold">— {dailyQuote.author}</p>
                
                <Button variant="outline" size="sm" className="w-full" onClick={fetchDailyQuote}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Quote
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Chat Preview */}
          <Card className="wellness-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 text-primary mr-2" />
                AI Companion
              </CardTitle>
              <CardDescription>
                Your supportive wellness companion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm">
                    "Hi! I noticed you're feeling pretty good today. Would you like to talk about what's contributing to your positive mood?"
                  </p>
                </div>
                
                <Link to="/chat">
                  <Button className="wellness-button-primary w-full">
                    Start Conversation
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="wellness-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">{journalCount}</p>
                  <p className="text-sm">Journal Entries</p>
                </div>
                <Brain className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="wellness-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Mood</p>
                  <p className="text-2xl font-bold">{averageMood || '0'}</p>
                  <p className="text-sm">This Month</p>
                </div>
                <Heart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="wellness-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Meditation</p>
                  <p className="text-2xl font-bold">{meditationTime}m</p>
                  <p className="text-sm">This Week</p>
                </div>
                <Wind className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;