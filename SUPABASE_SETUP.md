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

### Files Table
```sql
CREATE TABLE files (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size TEXT NOT NULL,
  file_path TEXT NOT NULL,
  public_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  upload_date DATE NOT NULL,
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

### Experiences Table
```sql
CREATE TABLE experiences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  achievements TEXT[] NOT NULL,
  skills TEXT[] NOT NULL,
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