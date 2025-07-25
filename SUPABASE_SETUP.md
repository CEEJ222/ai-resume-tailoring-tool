# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/login and create a new project
3. Wait for the project to be provisioned

## 2. Get Your Credentials

1. Go to your project dashboard
2. Navigate to Settings → API
3. Copy your:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## 3. Configure Environment Variables

Create a `.env` file in your project root:

```env
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Set Up Database Tables

Run these SQL commands in your Supabase SQL Editor:

### Files Table (Enhanced)
```sql
CREATE TABLE files (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- resume, writing_sample, resource, cover_letter, etc.
  size TEXT NOT NULL,
  file_path TEXT NOT NULL,
  public_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  upload_date DATE NOT NULL,
  content_extracted JSONB DEFAULT '{}', -- Parsed content from document
  skills_identified TEXT[] DEFAULT '{}', -- Skills found in document
  experiences_identified JSONB DEFAULT '[]', -- Job experiences found
  confidence_score FLOAT DEFAULT 0.0, -- Extraction confidence
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own files
CREATE POLICY "Users can view own files" ON files
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own files
CREATE POLICY "Users can insert own files" ON files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own files
CREATE POLICY "Users can update own files" ON files
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own files
CREATE POLICY "Users can delete own files" ON files
  FOR DELETE USING (auth.uid() = user_id);
```

### Experiences Table (Enhanced)
```sql
CREATE TABLE experiences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  period TEXT NOT NULL, -- "January 2023 - Present" or "2020-2022"
  achievements JSONB DEFAULT '[]', -- Array of achievement objects
  skills_with_evidence JSONB DEFAULT '[]', -- Array of skill objects with evidence
  extracted_from TEXT[], -- Array of file IDs this experience came from
  is_merged BOOLEAN DEFAULT FALSE, -- Whether this was merged from multiple sources
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Create policies for experiences
CREATE POLICY "Users can view own experiences" ON experiences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experiences" ON experiences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiences" ON experiences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiences" ON experiences
  FOR DELETE USING (auth.uid() = user_id);
```

### Skill Profiles Table
```sql
CREATE TABLE skill_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  skills JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE skill_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for skill_profiles
CREATE POLICY "Users can view their own skill profile" ON skill_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skill profile" ON skill_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill profile" ON skill_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skill profile" ON skill_profiles
  FOR DELETE USING (auth.uid() = user_id);
```

### Skills Database Table
```sql
CREATE TABLE skills_database (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('technical', 'product', 'leadership', 'domain', 'soft')),
  description TEXT,
  aliases TEXT[], -- Alternative names/variations for the skill
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial skills data
INSERT INTO skills_database (name, category, description, aliases) VALUES
-- Technical Skills
('React', 'technical', 'Frontend JavaScript library for building user interfaces', ARRAY['jsx', 'reactjs', 'react.js']),
('JavaScript', 'technical', 'Programming language for web development', ARRAY['js', 'es6', 'es2015', 'ecmascript']),
('TypeScript', 'technical', 'Typed superset of JavaScript', ARRAY['ts', 'typescript']),
('Python', 'technical', 'Programming language for data science and web development', ARRAY['python3', 'django', 'flask']),
('SQL', 'technical', 'Database query language', ARRAY['mysql', 'postgresql', 'database']),
('API Integration', 'technical', 'Connecting applications via APIs', ARRAY['api', 'rest', 'graphql', 'endpoint']),
('Mobile Development', 'technical', 'Building mobile applications', ARRAY['mobile', 'ios', 'android', 'react native']),
('AWS', 'technical', 'Amazon Web Services cloud platform', ARRAY['amazon web services', 'cloud']),
('Docker', 'technical', 'Containerization platform', ARRAY['containers', 'kubernetes']),
('Machine Learning', 'technical', 'AI/ML algorithms and models', ARRAY['ml', 'ai', 'artificial intelligence']),
('Data Analysis', 'technical', 'Analyzing and interpreting data', ARRAY['analytics', 'data science', 'statistics']),

-- Product Skills
('Product Strategy', 'product', 'Strategic planning for product development', ARRAY['strategy', 'roadmap', 'product vision']),
('Roadmapping', 'product', 'Creating product roadmaps', ARRAY['roadmap', 'planning', 'timeline']),
('A/B Testing', 'product', 'Testing different versions to optimize performance', ARRAY['ab testing', 'experiment', 'testing']),
('User Research', 'product', 'Understanding user needs and behaviors', ARRAY['ux research', 'user testing', 'research']),
('Product Discovery', 'product', 'Identifying product opportunities', ARRAY['discovery', 'opportunity identification']),
('Go-to-Market', 'product', 'Launching products to market', ARRAY['gtm', 'launch', 'marketing']),
('Competitive Analysis', 'product', 'Analyzing competitors and market', ARRAY['competitive', 'market analysis']),
('Analytics', 'product', 'Using data to make product decisions', ARRAY['data analytics', 'metrics', 'kpis']),
('Agile/Scrum', 'product', 'Agile development methodology', ARRAY['agile', 'scrum', 'sprint', 'kanban']),
('Lean Startup', 'product', 'Lean methodology for startups', ARRAY['lean', 'mvp', 'minimum viable product']),
('Design Thinking', 'product', 'Human-centered design approach', ARRAY['design', 'user-centered design']),

-- Leadership Skills
('Team Leadership', 'leadership', 'Leading and managing teams', ARRAY['lead', 'manage', 'team', 'mentor']),
('Cross-functional Teams', 'leadership', 'Working across different departments', ARRAY['cross-functional', 'collaboration', 'partnership']),
('Stakeholder Management', 'leadership', 'Managing relationships with stakeholders', ARRAY['stakeholder', 'executive', 'c-level']),
('Strategic Planning', 'leadership', 'Long-term strategic thinking', ARRAY['strategy', 'planning', 'vision']),
('Change Management', 'leadership', 'Managing organizational change', ARRAY['change', 'transformation', 'organizational change']),
('Budget Management', 'leadership', 'Managing budgets and resources', ARRAY['budget', 'financial management', 'p&l']),
('Vendor Management', 'leadership', 'Managing third-party vendors', ARRAY['vendor', 'partner', 'third-party']),
('Crisis Management', 'leadership', 'Handling crisis situations', ARRAY['crisis', 'emergency', 'problem solving']),
('Mentoring', 'leadership', 'Mentoring and coaching others', ARRAY['mentor', 'coach', 'develop']),
('Coaching', 'leadership', 'Coaching team members', ARRAY['coach', 'mentor', 'develop']),

-- Domain Skills
('SaaS', 'domain', 'Software as a Service business model', ARRAY['software as a service', 'subscription', 'b2b']),
('eCommerce', 'domain', 'Electronic commerce and online retail', ARRAY['ecommerce', 'retail', 'shopping', 'marketplace']),
('Healthcare', 'domain', 'Healthcare industry knowledge', ARRAY['healthcare', 'medical', 'clinical', 'patient', 'hipaa']),
('FinTech', 'domain', 'Financial technology', ARRAY['fintech', 'financial', 'banking', 'payments']),
('Mobile Apps', 'domain', 'Mobile application ecosystem', ARRAY['mobile apps', 'app store', 'mobile ecosystem']),
('AI/ML', 'domain', 'Artificial Intelligence and Machine Learning', ARRAY['ai', 'ml', 'artificial intelligence', 'machine learning']),
('Cybersecurity', 'domain', 'Information security and privacy', ARRAY['security', 'cyber', 'privacy', 'compliance']),
('IoT', 'domain', 'Internet of Things', ARRAY['iot', 'connected devices', 'smart devices']),
('Compliance', 'domain', 'Regulatory compliance', ARRAY['regulatory', 'compliance', 'governance']),
('Regulatory', 'domain', 'Understanding regulatory requirements', ARRAY['regulation', 'compliance', 'legal']),

-- Soft Skills (High Importance)
('Problem-Solving & Analytical Thinking', 'soft', 'Approaching problems logically, analyzing complex issues, and developing innovative solutions', ARRAY['problem solving', 'analytical thinking', 'critical thinking', 'logical thinking', 'analysis']),
('Communication', 'soft', 'Explaining complex concepts clearly, collaborating in teams, providing and receiving feedback', ARRAY['verbal communication', 'written communication', 'presentation', 'interpersonal', 'feedback']),
('Adaptability', 'soft', 'Flexibility in tackling unexpected issues and learning new technologies', ARRAY['flexible', 'adaptable', 'learning', 'change management', 'resilience']),
('Collaboration/Teamwork', 'soft', 'Working effectively with colleagues in cross-functional environments to achieve goals', ARRAY['teamwork', 'collaboration', 'team player', 'cross-functional', 'partnership']),
('Curiosity', 'soft', 'Asking the right questions, exploring data, and seeking new solutions', ARRAY['inquisitive', 'exploration', 'learning mindset', 'investigation', 'research']),

-- Soft Skills (Medium Importance)
('Business Acumen', 'soft', 'Understanding the business landscape, identifying relevant problems, and building effective solutions', ARRAY['business understanding', 'commercial awareness', 'business sense', 'market knowledge']),
('Time Management', 'soft', 'Prioritizing tasks effectively, meeting deadlines, and balancing multiple responsibilities', ARRAY['prioritization', 'deadlines', 'organization', 'efficiency', 'productivity']),
('Creativity', 'soft', 'Coming up with new ideas and innovative solutions for technological issues', ARRAY['innovation', 'creative thinking', 'ideation', 'out-of-the-box thinking']),
('Attention to Detail', 'soft', 'Careful review of documentation and code to ensure accuracy and prevent errors', ARRAY['detail-oriented', 'accuracy', 'quality control', 'precision', 'thoroughness']);

-- Enable Row Level Security (read-only for all users)
ALTER TABLE skills_database ENABLE ROW LEVEL SECURITY;

-- Create policies for skills_database (read-only for all authenticated users)
CREATE POLICY "All users can view skills database" ON skills_database
  FOR SELECT USING (auth.role() = 'authenticated');
```

## 5. Set Up Storage Buckets

1. Go to Storage in your Supabase dashboard
2. Create three buckets:
   - `resumes` (for resume files)
   - `writing-samples` (for writing samples)
   - `resources` (for other resources)

3. For each bucket, set up policies:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.role() = 'authenticated');

-- Allow users to view their own files
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
```

Repeat for `writing-samples` and `resources` buckets.

## 6. Test the Setup

1. Start your React app: `npm start`
2. Go to the Profile Builder tab
3. Try uploading a file
4. Check the Supabase dashboard to see if files appear in Storage and database

## Troubleshooting

- **"Invalid API key"**: Check your environment variables
- **"Bucket not found"**: Make sure you created the storage buckets
- **"Policy violation"**: Check your RLS policies
- **"Table doesn't exist"**: Run the SQL commands to create tables 