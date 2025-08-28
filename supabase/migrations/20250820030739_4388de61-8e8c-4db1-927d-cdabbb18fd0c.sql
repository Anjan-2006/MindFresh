-- Enable RLS on existing tables that don't have it
ALTER TABLE public.journaltable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moodTable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for journaltable
CREATE POLICY "Users can view their own journal entries"
ON public.journaltable
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries"
ON public.journaltable
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
ON public.journaltable
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
ON public.journaltable
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for moodTable
CREATE POLICY "Users can view their own mood entries"
ON public.moodTable
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood entries"
ON public.moodTable
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries"
ON public.moodTable
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries"
ON public.moodTable
FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for Tasks (making it accessible to authenticated users)
CREATE POLICY "Authenticated users can view tasks"
ON public.Tasks
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create tasks"
ON public.Tasks
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks"
ON public.Tasks
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete tasks"
ON public.Tasks
FOR DELETE
TO authenticated
USING (true);