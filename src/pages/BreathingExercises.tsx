import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Play, Pause, RotateCcw, Wind, Heart, Brain } from "lucide-react";

const BreathingExercises = () => {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("inhale");
  const [secondsRemaining, setSecondsRemaining] = useState(4);

  const exercises = [
    {
      id: "box-breathing",
      title: "Box Breathing",
      description: "4-4-4-4 pattern for stress relief and focus",
      icon: <Wind className="h-8 w-8" />,
      phases: [
        { name: "inhale", duration: 4, instruction: "Breathe in slowly" },
        { name: "hold", duration: 4, instruction: "Hold your breath" },
        { name: "exhale", duration: 4, instruction: "Breathe out slowly" },
        { name: "hold", duration: 4, instruction: "Hold empty" }
      ]
    },
    {
      id: "calm-breathing",
      title: "Calm Breathing",
      description: "4-7-8 pattern for relaxation and sleep",
      icon: <Heart className="h-8 w-8" />,
      phases: [
        { name: "inhale", duration: 4, instruction: "Breathe in through nose" },
        { name: "hold", duration: 7, instruction: "Hold your breath" },
        { name: "exhale", duration: 8, instruction: "Breathe out through mouth" }
      ]
    },
    {
      id: "energy-breathing",
      title: "Energy Breathing",
      description: "Equal breathing for balance and energy",
      icon: <Brain className="h-8 w-8" />,
      phases: [
        { name: "inhale", duration: 6, instruction: "Breathe in deeply" },
        { name: "exhale", duration: 6, instruction: "Breathe out completely" }
      ]
    }
  ];

  const tips = [
    "Find a comfortable, quiet space to practice",
    "Sit or lie down with your back straight",
    "Place one hand on your chest, one on your belly",
    "Focus on breathing from your diaphragm",
    "Practice regularly for best results",
    "Don't force your breath - let it flow naturally"
  ];

  const startExercise = (exerciseId: string) => {
    setActiveExercise(exerciseId);
    setIsPlaying(true);
    setCurrentPhase("inhale");
    setSecondsRemaining(4);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setIsPlaying(false);
    setCurrentPhase("inhale");
    setSecondsRemaining(4);
  };

  const getCurrentExercise = () => {
    return exercises.find(ex => ex.id === activeExercise);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Breathing <span className="text-gradient">Exercises</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Reduce stress, improve focus, and enhance wellbeing with guided breathing techniques
          </p>
        </div>

        {/* Active Exercise Display */}
        {activeExercise && (
          <div className="mb-12">
            <Card className="wellness-card max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {getCurrentExercise()?.title}
                </CardTitle>
                <CardDescription>
                  {getCurrentExercise()?.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                {/* Breathing Circle */}
                <div className="relative w-48 h-48 mx-auto">
                  <div 
                    className={`w-full h-full rounded-full bg-gradient-primary transition-all duration-1000 ${
                      isPlaying && currentPhase === 'inhale' ? 'scale-110' : 'scale-100'
                    }`}
                    style={{
                      background: 'var(--gradient-primary)',
                    }}
                  >
                    <div className="absolute inset-4 rounded-full bg-card flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {secondsRemaining}
                        </div>
                        <div className="text-lg font-medium capitalize">
                          {currentPhase}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-lg font-medium text-muted-foreground">
                  {getCurrentExercise()?.phases.find(p => p.name === currentPhase)?.instruction}
                </div>

                {/* Controls */}
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={togglePlayPause}
                    className="wellness-button-primary"
                    size="lg"
                  >
                    {isPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                  <Button
                    onClick={resetExercise}
                    variant="outline"
                    size="lg"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Exercise Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {exercises.map((exercise) => (
            <Card 
              key={exercise.id} 
              className={`wellness-card cursor-pointer transition-all ${
                activeExercise === exercise.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => startExercise(exercise.id)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {exercise.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{exercise.title}</h3>
                <p className="text-muted-foreground mb-4">{exercise.description}</p>
                <Button 
                  className="wellness-button-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    startExercise(exercise.id);
                  }}
                >
                  Start Exercise
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips Section */}
        <Card className="wellness-card">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Breathing Tips
            </CardTitle>
            <CardDescription className="text-center">
              Get the most out of your breathing practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default BreathingExercises;