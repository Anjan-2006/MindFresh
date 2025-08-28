import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Heart,
  Brain,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Progress = () => {
  const { user } = useAuth();
  const [moodData, setMoodData] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [emotionData, setEmotionData] = useState<any[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [averageMood, setAverageMood] = useState(0);
  const [journalEntries, setJournalEntries] = useState(0);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [insights, setInsights] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  const fetchProgressData = async () => {
    if (!user) return;

    try {
      // Fetch mood data for the past week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      const { data: weeklyMoods } = await supabase
        .from("moodTable")
        .select("mood_value, created_at")
        .eq("user_id", user.id)
        .gte("created_at", weekStart.toISOString())
        .order("created_at", { ascending: true });

      if (weeklyMoods) {
        const moodsByDay = weeklyMoods.reduce((acc: any, entry: any) => {
          const date = new Date(entry.created_at);
          const dayName = date.toLocaleDateString("en-US", {
            weekday: "short",
          });
          const dateStr = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          if (!acc[dayName]) {
            acc[dayName] = { day: dayName, date: dateStr, moods: [] };
          }
          acc[dayName].moods.push(entry.mood_value);
          return acc;
        }, {});

        const chartData = Object.values(moodsByDay).map((day: any) => ({
          ...day,
          mood:
            day.moods.reduce((sum: number, mood: number) => sum + mood, 0) /
            day.moods.length,
        }));

        setMoodData(chartData);
      }

      // Fetch monthly data for this month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: monthlyJournals } = await supabase
        .from("journaltable")
        .select("id, created_at")
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString());

      const { data: monthlyMoods } = await supabase
        .from("moodTable")
        .select("mood_value, created_at")
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString());

      const { data: monthlyMeditation } = await supabase
        .from("meditationtime")
        .select("session_duration, created_at")
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString());

      // Calculate statistics
      setJournalEntries(monthlyJournals?.length || 0);

      if (monthlyMoods && monthlyMoods.length > 0) {
        const avg =
          monthlyMoods.reduce((sum, entry) => sum + entry.mood_value, 0) /
          monthlyMoods.length;
        setAverageMood(Number(avg.toFixed(1)));
      }

      if (monthlyMoods) {
        calculateEmotionData(monthlyMoods);
      }

      // Calculate wellness score (combination of activities)
      const journalScore = Math.min((monthlyJournals?.length || 0) * 2, 40);
      const moodScore = averageMood * 4 || 0;
      const meditationScore = Math.min(
        ((monthlyMeditation?.reduce(
          (sum, session) => sum + session.session_duration,
          0
        ) || 0) /
          60) *
          2,
        20
      );
      setWellnessScore(Math.round(journalScore + moodScore + meditationScore));

      // Generate insights based on real data
      const generatedInsights = [
        {
          icon: TrendingUp,
          title: "Mood Trend",
          description:
            monthlyMoods && monthlyMoods.length > 0
              ? `Your average mood this month is ${(
                  monthlyMoods.reduce(
                    (sum, entry) => sum + entry.mood_value,
                    0
                  ) / monthlyMoods.length
                ).toFixed(1)}/10`
              : "Start tracking your mood to see trends",
          status: "positive",
        },
        {
          icon: Brain,
          title: "Journal Activity",
          description: `You've written ${
            monthlyJournals?.length || 0
          } journal entries this month`,
          status: "positive",
        },
        {
          icon: Target,
          title: "Meditation Progress",
          description: `${Math.floor(
            (monthlyMeditation?.reduce(
              (sum, session) => sum + session.session_duration,
              0
            ) || 0) / 60
          )} minutes of meditation this month`,
          status: "neutral",
        },
      ];
      setInsights(generatedInsights);

      // Generate achievements based on real data
      const generatedAchievements = [
        {
          title: "First Entry",
          description: "Made your first mood or journal entry",
          earned:
            (monthlyJournals && monthlyJournals.length > 0) ||
            (monthlyMoods && monthlyMoods.length > 0),
        },
        {
          title: "Journal Habit",
          description: "Wrote 5 journal entries",
          earned: (monthlyJournals?.length || 0) >= 5,
        },
        {
          title: "Meditation Master",
          description: "Completed 30 minutes of breathing exercises",
          earned:
            (monthlyMeditation?.reduce(
              (sum, session) => sum + session.session_duration,
              0
            ) || 0) /
              60 >=
            30,
        },
        {
          title: "Mood Tracker",
          description: "Tracked your mood 10 times",
          earned: (monthlyMoods?.length || 0) >= 10,
        },
      ];
      setAchievements(generatedAchievements);

      // Generate weekly stats for the past 4 weeks
      const stats = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - i * 7);

        const { data: weekJournals } = await supabase
          .from("journaltable")
          .select("id")
          .eq("user_id", user.id)
          .gte("created_at", weekStart.toISOString())
          .lt("created_at", weekEnd.toISOString());

        const { data: weekMoods } = await supabase
          .from("moodTable")
          .select("mood_value")
          .eq("user_id", user.id)
          .gte("created_at", weekStart.toISOString())
          .lt("created_at", weekEnd.toISOString());

        const { data: weekMeditation } = await supabase
          .from("meditationtime")
          .select("session_duration")
          .eq("user_id", user.id)
          .gte("created_at", weekStart.toISOString())
          .lt("created_at", weekEnd.toISOString());

        stats.push({
          week: `Week ${4 - i}`,
          journalEntries: weekJournals?.length || 0,
          moodAvg:
            weekMoods && weekMoods.length > 0
              ? Number(
                  (
                    weekMoods.reduce(
                      (sum, entry) => sum + entry.mood_value,
                      0
                    ) / weekMoods.length
                  ).toFixed(1)
                )
              : 0,
          meditation: Math.floor(
            (weekMeditation?.reduce(
              (sum, session) => sum + session.session_duration,
              0
            ) || 0) / 60
          ),
        });
      }
      setWeeklyStats(stats);
    } catch (error) {
      console.error("Failed to fetch progress data:", error);
    }
  };

  const calculateEmotionData = (monthlyMoods: any[]) => {
    if (!monthlyMoods || monthlyMoods.length === 0) {
      setEmotionData([]);
      return;
    }

    // Example logic: map mood values (1–10) to emotions
    const emotionCategories = {
      Happy: (value: number) => value >= 7,
      Neutral: (value: number) => value >= 4 && value < 7,
      Sad: (value: number) => value < 4,
    };

    const counts: Record<string, number> = { Happy: 0, Neutral: 0, Sad: 0 };

    monthlyMoods.forEach((entry) => {
      for (const [emotion, condition] of Object.entries(emotionCategories)) {
        if (condition(entry.mood_value)) {
          counts[emotion]++;
        }
      }
    });

    const total = monthlyMoods.length;
    const formatted = Object.entries(counts).map(([name, count], idx) => ({
      name,
      value: Math.round((count / total) * 100), // percentage
      color: ["#34d399", "#60a5fa", "#f87171"][idx], // green, blue, red
    }));

    setEmotionData(formatted);
  };

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Your <span className="text-gradient">Progress Journey</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your wellness journey and celebrate your growth
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="wellness-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Streak
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {currentStreak}
                  </p>
                  <p className="text-sm">Days active</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="wellness-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Mood</p>
                  <p className="text-3xl font-bold text-wellness-green">
                    {averageMood || "0"}
                  </p>
                  <p className="text-sm">This month</p>
                </div>
                <Heart className="h-8 w-8 text-wellness-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="wellness-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Journal Entries
                  </p>
                  <p className="text-3xl font-bold text-wellness-blue">
                    {journalEntries}
                  </p>
                  <p className="text-sm">This month</p>
                </div>
                <Brain className="h-8 w-8 text-wellness-blue" />
              </div>
            </CardContent>
          </Card>

          <Card className="wellness-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Wellness Score
                  </p>
                  <p className="text-3xl font-bold text-wellness-purple">
                    {wellnessScore}
                  </p>
                  <p className="text-sm">Out of 100</p>
                </div>
                <BarChart3 className="h-8 w-8 text-wellness-purple" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Mood Trend Chart */}
          <Card className="wellness-card">
            <CardHeader>
              <CardTitle>Weekly Mood Trend</CardTitle>
              <CardDescription>
                Your mood patterns over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" />
                  <YAxis domain={[1, 10]} />
                  <Tooltip
                    formatter={(value) => [`${value}/10`, "Mood"]}
                    labelFormatter={(label) => {
                      const item = moodData.find((d) => d.day === label);
                      return item ? `${item.day}, ${item.date}` : label;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="hsl(170 77% 36%)"
                    strokeWidth={3}
                    dot={{ fill: "hsl(170 77% 36%)", strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Emotion Distribution */}
          <Card className="wellness-card">
            <CardHeader>
              <CardTitle>Emotion Distribution</CardTitle>
              <CardDescription>
                How you've been feeling this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={emotionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {emotionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Activity Chart */}
        <Card className="wellness-card mb-8">
          <CardHeader>
            <CardTitle>Monthly Activity Overview</CardTitle>
            <CardDescription>
              Your wellness activities across the past 4 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="journalEntries"
                  fill="hsl(142 76% 48%)"
                  name="Journal Entries"
                />
                <Bar
                  dataKey="meditation"
                  fill="hsl(200 98% 65%)"
                  name="Meditation (minutes)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Insights and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Insights */}
          <Card className="wellness-card">
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>
                Personalized observations about your wellness journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50"
                  >
                    <insight.icon
                      className={`h-5 w-5 mt-0.5 ${
                        insight.status === "positive"
                          ? "text-wellness-green"
                          : "text-wellness-blue"
                      }`}
                    />
                    <div>
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-secondary rounded-lg">
                <h4 className="font-semibold mb-2">Weekly Recommendation</h4>
                <p className="text-sm text-muted-foreground">
                  Your mood tends to be highest on Fridays. Try scheduling
                  important conversations or activities on these days to
                  maximize your positive energy.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="wellness-card">
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>
                Celebrate your wellness milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      achievement.earned
                        ? "bg-wellness-green/10 border-wellness-green/20"
                        : "bg-muted/50 border-border"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.earned
                          ? "bg-wellness-green text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {achievement.earned ? "🏆" : "🔒"}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button className="wellness-button-primary w-full">
                  Share Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Progress;