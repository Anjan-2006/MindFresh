-- Create MeditationTime table to track breathing exercise sessions
CREATE TABLE public.meditationtime (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_duration INTEGER NOT NULL DEFAULT 0, -- Duration in seconds
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.meditationtime ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own meditation sessions" 
ON public.meditationtime 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meditation sessions" 
ON public.meditationtime 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meditation sessions" 
ON public.meditationtime 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meditation sessions" 
ON public.meditationtime 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_meditationtime_updated_at
BEFORE UPDATE ON public.meditationtime
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();