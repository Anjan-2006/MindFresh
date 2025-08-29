import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { Music, Play, Pause, Youtube, BookOpen, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Track {
  id: string;
  title: string;
  user: {
    name: string;
  };
  genre?: string;
  duration: number;
}

interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail: string;
    };
    publishedDate?: string;
  };
}

const Recommendations = () => {
  const [currentMood, setCurrentMood] = useState(5);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingTracks, setPlayingTracks] = useState<Set<string>>(new Set());
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Mood-based content mapping
  const getMoodBasedContent = (mood: number) => {
    if (mood <= 3) {
      return {
        musicQuery: "relaxing meditation ambient",
        podcastQuery: "mental health therapy mindfulness",
        bookQuery: "self help depression anxiety"
      };
    } else if (mood <= 6) {
      return {
        musicQuery: "chill peaceful calm",
        podcastQuery: "motivation wellness lifestyle",
        bookQuery: "psychology happiness mindfulness"
      };
    } else {
      return {
        musicQuery: "uplifting energetic positive",
        podcastQuery: "success motivation inspiration",
        bookQuery: "personal development success happiness"
      };
    }
  };

  const fetchUserMood = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('moodTable')
        .select('mood_value')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setCurrentMood(data[0].mood_value);
      }
    } catch (error) {
      console.error('Failed to fetch mood:', error);
    }
  };

  const fetchAudiusTracks = async (query: string) => {
    try {
      const response = await fetch(
        `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&limit=20&app_name=mindfresh`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Filter out short tracks (< 30 seconds) to get full songs only
        const fullTracks = (data.data || []).filter((track: Track) => track.duration > 30);
        setTracks(fullTracks.slice(0, 6)); // Take first 6 full tracks
      }
    } catch (error) {
      console.error('Failed to fetch Audius tracks:', error);
      toast({
        title: "Error",
        description: "Failed to load music recommendations",
        variant: "destructive"
      });
    }
  };

  const fetchYouTubeVideos = async (query: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('youtube-search', {
        body: { query }
      })
      
      if (error) throw error
      
      if (data && data.items) {
        setVideos(data.items)
      }
    } catch (error) {
      console.error('Failed to fetch YouTube videos:', error);
      toast({
        title: "Error", 
        description: "Failed to load podcast recommendations",
        variant: "destructive"
      });
    }
  };

  const fetchBooks = async (query: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6`
      );
      
      if (response.ok) {
        const data = await response.json();
        setBooks(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
      toast({
        title: "Error",
        description: "Failed to load book recommendations", 
        variant: "destructive"
      });
    }
  };

  const loadRecommendations = async () => {
    setLoading(true);
    const content = getMoodBasedContent(currentMood);
    
    await Promise.all([
      fetchAudiusTracks(content.musicQuery),
      fetchYouTubeVideos(content.podcastQuery),
      fetchBooks(content.bookQuery)
    ]);
    
    setLoading(false);
  };

  const playTrack = (trackId: string) => {
    setPlayingTracks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMoodDescription = (mood: number) => {
    if (mood <= 3) return "uplifting and calming";
    if (mood <= 6) return "peaceful and balanced";
    return "energizing and positive";
  };

  const getMoodEmoji = (mood: number) => {
    if (mood <= 3) return "😔";
    if (mood <= 6) return "🙂"; 
    return "😊";
  };

  useEffect(() => {
    fetchUserMood();
  }, [user]);

  useEffect(() => {
    if (currentMood) {
      loadRecommendations();
    }
  }, [currentMood]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">Personalized Recommendations</span>
          </h1>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-2xl">{getMoodEmoji(currentMood)}</span>
            <p className="text-lg text-muted-foreground">
              Based on your current mood ({currentMood}/10), here are some {getMoodDescription(currentMood)} recommendations
            </p>
          </div>
          <Button 
            onClick={loadRecommendations} 
            variant="outline" 
            disabled={loading}
            className="mb-6"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Recommendations
          </Button>
        </div>

        {loading && (
          <div className="text-center mb-8">
            <Progress value={33} className="w-full max-w-md mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Loading personalized content...</p>
          </div>
        )}

        {/* Music Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Music className="h-6 w-6 text-primary mr-2" />
            Music for Your Mood
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.length === 0 && !loading ? (
              <p className="text-muted-foreground col-span-full text-center py-8">No music recommendations found. Try refreshing or check your connection.</p>
            ) : (
              tracks.map((track) => (
              <Card key={track.id} className="wellness-card">
                <CardContent className="p-4">
                  <h3 className="font-semibold truncate mb-2">{track.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">by {track.user.name}</p>
                  <p className="text-xs text-muted-foreground mb-4">Duration: {formatDuration(track.duration)}</p>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <Button
                      size="sm"
                      onClick={() => playTrack(track.id)}
                      className="wellness-button-primary"
                    >
                      {playingTracks.has(track.id) ? (
                        <Pause className="h-4 w-4 mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {playingTracks.has(track.id) ? 'Pause' : 'Play'}
                    </Button>
                  </div>
                  
                  <audio
                    controls
                    className="w-full"
                    src={`https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream?app_name=mindfresh`}
                    onPlay={() => setPlayingTracks(prev => new Set(prev).add(track.id))}
                    onPause={() => setPlayingTracks(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(track.id);
                      return newSet;
                    })}
                  />
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </section>

        {/* Podcasts Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Youtube className="h-6 w-6 text-primary mr-2" />
            Wellness Podcasts & Videos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id.videoId} className="wellness-card">
                <CardContent className="p-4">
                  <div className="aspect-video mb-3">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${video.id.videoId}`} 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="rounded"
                    />
                  </div>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{video.snippet.title}</h3>
                  <p className="text-xs text-muted-foreground">{video.snippet.channelTitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Books Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <BookOpen className="h-6 w-6 text-primary mr-2" />
            Recommended Reading
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.id} className="wellness-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedBook(book)}>
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    {book.volumeInfo.imageLinks?.thumbnail && (
                      <img 
                        src={book.volumeInfo.imageLinks.thumbnail} 
                        alt={book.volumeInfo.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{book.volumeInfo.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {book.volumeInfo.authors?.join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {book.volumeInfo.publishedDate}
                      </p>
                    </div>
                  </div>
                  {book.volumeInfo.description && (
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-3">
                      {book.volumeInfo.description}
                    </p>
                  )}
                  <p className="text-xs text-primary mt-2">Click to read more</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedBook(null)}>
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedBook.volumeInfo.title}</h2>
                <Button variant="outline" size="sm" onClick={() => setSelectedBook(null)}>✕</Button>
              </div>
              
              <div className="flex space-x-6 mb-6">
                {selectedBook.volumeInfo.imageLinks?.thumbnail && (
                  <img 
                    src={selectedBook.volumeInfo.imageLinks.thumbnail} 
                    alt={selectedBook.volumeInfo.title}
                    className="w-32 h-48 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="text-lg text-muted-foreground mb-2">
                    {selectedBook.volumeInfo.authors?.join(', ')}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Published: {selectedBook.volumeInfo.publishedDate}
                  </p>
                  {selectedBook.volumeInfo.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedBook.volumeInfo.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;