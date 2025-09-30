-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  organization_type TEXT NOT NULL CHECK (organization_type IN ('rows', 'tables')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "classes_select_own" ON public.classes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "classes_insert_own" ON public.classes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "classes_update_own" ON public.classes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "classes_delete_own" ON public.classes FOR DELETE USING (auth.uid() = user_id);

-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  roll_no TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  position_group TEXT, -- row number or table number
  position_seat INTEGER, -- seat position within row/table
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, roll_no)
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_select_own" ON public.students FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = students.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "students_insert_own" ON public.students FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = students.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "students_update_own" ON public.students FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = students.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "students_delete_own" ON public.students FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = students.class_id AND classes.user_id = auth.uid()
  ));

-- Create attendance records table
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  present BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance_select_own" ON public.attendance_records FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = attendance_records.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "attendance_insert_own" ON public.attendance_records FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = attendance_records.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "attendance_update_own" ON public.attendance_records FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = attendance_records.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "attendance_delete_own" ON public.attendance_records FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = attendance_records.class_id AND classes.user_id = auth.uid()
  ));

-- Create participation comments table
CREATE TABLE IF NOT EXISTS public.participation_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  comment TEXT NOT NULL,
  relevance TEXT, -- relevant, somewhat_relevant, not_relevant
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.participation_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participation_select_own" ON public.participation_comments FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = participation_comments.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "participation_insert_own" ON public.participation_comments FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = participation_comments.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "participation_update_own" ON public.participation_comments FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = participation_comments.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "participation_delete_own" ON public.participation_comments FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = participation_comments.class_id AND classes.user_id = auth.uid()
  ));

-- Create class schedules table
CREATE TABLE IF NOT EXISTS public.class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedules_select_own" ON public.class_schedules FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = class_schedules.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "schedules_insert_own" ON public.class_schedules FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = class_schedules.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "schedules_update_own" ON public.class_schedules FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = class_schedules.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "schedules_delete_own" ON public.class_schedules FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = class_schedules.class_id AND classes.user_id = auth.uid()
  ));

-- Create grades table
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  assessment_name TEXT NOT NULL,
  score NUMERIC NOT NULL,
  max_score NUMERIC NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grades_select_own" ON public.grades FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = grades.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "grades_insert_own" ON public.grades FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = grades.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "grades_update_own" ON public.grades FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = grades.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "grades_delete_own" ON public.grades FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = grades.class_id AND classes.user_id = auth.uid()
  ));

-- Create class reports table
CREATE TABLE IF NOT EXISTS public.class_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  report_type TEXT NOT NULL, -- attendance, participation, comprehensive
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.class_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select_own" ON public.class_reports FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = class_reports.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "reports_insert_own" ON public.class_reports FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = class_reports.class_id AND classes.user_id = auth.uid()
  ));

CREATE POLICY "reports_delete_own" ON public.class_reports FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.classes 
    WHERE classes.id = class_reports.class_id AND classes.user_id = auth.uid()
  ));

-- Create trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', null)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
