import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Check if credentials are properly configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'

let supabase = null

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('Supabase client initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    supabase = null
  }
} else {
  console.warn('Supabase credentials not configured. Running in demo mode.')
  console.log('To enable Supabase, create a .env file with:')
  console.log('REACT_APP_SUPABASE_URL=your_project_url')
  console.log('REACT_APP_SUPABASE_ANON_KEY=your_anon_key')
}

export { supabase }

// Storage bucket names
export const STORAGE_BUCKETS = {
  RESUMES: 'resumes',
  WRITING_SAMPLES: 'writing-samples',
  RESOURCES: 'resources'
}

// Database table names
export const TABLES = {
  FILES: 'files',
  USERS: 'users',
  EXPERIENCES: 'experiences'
} 