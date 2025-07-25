import React, { useState, useEffect } from 'react';
import { Upload, FileText, BookOpen, Briefcase, User, Plus, Edit, Trash2, Check, X, AlertCircle, BriefcaseIcon, Loader2, ChevronLeft, ChevronRight, UserCheck, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';

const EnhancedProfileBuilder = ({ user }) => {
  const [files, setFiles] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddExperienceModal, setShowAddExperienceModal] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [newExperience, setNewExperience] = useState({
    company: '',
    role: '',
    period: '',
    type: 'job',
    achievements: [''],
    skills: []
  });
  const [newSkill, setNewSkill] = useState({
    skill: '',
    evidence: '',
    impact: ''
  });
  const [availableSkills, setAvailableSkills] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMasterProfile, setShowMasterProfile] = useState(false);
  const [currentExperienceIndex, setCurrentExperienceIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [showDeleteExperienceModal, setShowDeleteExperienceModal] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState(null);
  const [showFilesList, setShowFilesList] = useState(false);
  const [draggedExperience, setDraggedExperience] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);

  // Load files, experiences, and skills database
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          await Promise.all([
            loadFiles(),
            loadExperiences(),
            loadSkillsDatabase()
          ]);
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }
  }, [user]);

  const loadSkillsDatabase = async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('skills_database')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setAvailableSkills(data || []);
    } catch (error) {
      console.error('Error loading skills database:', error);
      // Fallback to basic skills if database doesn't exist
      setAvailableSkills([
        { id: 1, name: 'Product Management', category: 'product' },
        { id: 2, name: 'React', category: 'technical' },
        { id: 3, name: 'Team Leadership', category: 'leadership' },
        { id: 4, name: 'Healthcare', category: 'domain' },
        { id: 5, name: 'Problem-Solving & Analytical Thinking', category: 'soft' },
        { id: 6, name: 'Communication', category: 'soft' },
        { id: 7, name: 'Adaptability', category: 'soft' },
        { id: 8, name: 'Collaboration/Teamwork', category: 'soft' }
      ]);
    }
  };

  const loadFiles = async () => {
    if (!user || !supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const loadExperiences = async () => {
    if (!user || !supabase) return;
    
    try {
      // Load experiences with their accomplishments, ordered by display_order
      const { data, error } = await supabase
        .from('experiences')
        .select(`
          *,
          accomplishments (
            id,
            description,
            impact,
            date,
            category,
            tags
          )
        `)
        .eq('user_id', user.id)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include achievements array for backward compatibility
      const experiencesWithAchievements = (data || []).map(experience => ({
        ...experience,
        achievements: experience.accomplishments?.map(acc => acc.description) || []
      }));
      
      setExperiences(experiencesWithAchievements);
      
      // Initialize display_order for experiences that don't have it
      await initializeDisplayOrder(experiencesWithAchievements);
      
    } catch (error) {
      console.error('Error loading experiences:', error);
    }
  };

  const initializeDisplayOrder = async (experiences) => {
    if (!experiences || experiences.length === 0) return;
    
    try {
      // Check if any experiences don't have display_order
      const needsUpdate = experiences.some(exp => exp.display_order === null || exp.display_order === undefined);
      
      if (needsUpdate) {
        console.log('🔄 Initializing display_order for experiences...');
        
        const updatePromises = experiences.map((exp, index) => 
          supabase
            .from('experiences')
            .update({ display_order: index })
            .eq('id', exp.id)
        );
        
        await Promise.all(updatePromises);
        console.log('✅ Display order initialized');
      }
    } catch (error) {
      console.error('Error initializing display order:', error);
    }
  };

  const readFileContent = async (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        // For text files, read directly
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        }
        // For DOCX files
        else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const mammoth = await import('mammoth');
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        }
        // For PDF files - currently not supported due to browser limitations
        else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
          resolve('PDF files are not currently supported. Please convert your PDF to DOCX format or save as TXT file.');
        }
        // For other file types, try to read as text
        else {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        }
      } catch (error) {
        console.error('Error reading file content:', error);
        reject(error);
      }
    });
  };

  const extractSkillsFromText = (text) => {
    const extractedSkills = [];
    const textLower = text.toLowerCase();
    
    // Check each skill in the database against the text
    availableSkills.forEach(skill => {
      const skillLower = skill.name.toLowerCase();
      
      // Check for exact matches and variations
      if (textLower.includes(skillLower) || 
          textLower.includes(skillLower.replace(/\s+/g, '')) ||
          textLower.includes(skillLower.replace(/\s+/g, '-'))) {
        extractedSkills.push(skill);
      }
    });

    // Also check for common skill patterns
    const skillPatterns = {
      'React': ['react', 'jsx', 'component'],
      'JavaScript': ['javascript', 'js', 'es6', 'es2015'],
      'TypeScript': ['typescript', 'ts'],
      'Python': ['python', 'django', 'flask'],
      'SQL': ['sql', 'mysql', 'postgresql', 'database'],
      'API Integration': ['api', 'rest', 'graphql', 'endpoint'],
      'Mobile Development': ['mobile', 'ios', 'android', 'react native'],
      'Product Strategy': ['strategy', 'roadmap', 'product vision'],
      'Team Leadership': ['lead', 'manage', 'team', 'mentor'],
      'Cross-functional': ['cross-functional', 'collaboration', 'partnership'],
      'Stakeholder Management': ['stakeholder', 'executive', 'c-level'],
      'User Research': ['user research', 'ux research', 'user testing'],
      'A/B Testing': ['a/b testing', 'ab testing', 'experiment'],
      'Agile/Scrum': ['agile', 'scrum', 'sprint', 'kanban'],
      'Healthcare': ['healthcare', 'medical', 'clinical', 'patient', 'hipaa'],
      'SaaS': ['saas', 'software as a service', 'subscription'],
      'eCommerce': ['ecommerce', 'retail', 'shopping', 'marketplace'],
      
      // Soft Skills
      'Problem-Solving & Analytical Thinking': ['problem solving', 'analytical thinking', 'critical thinking', 'logical thinking', 'analysis', 'problem-solve'],
      'Communication': ['communication', 'verbal', 'written', 'presentation', 'interpersonal', 'feedback'],
      'Adaptability': ['adaptability', 'flexible', 'adaptable', 'learning', 'change management', 'resilience'],
      'Collaboration/Teamwork': ['collaboration', 'teamwork', 'team player', 'cross-functional', 'partnership', 'collaborate'],
      'Curiosity': ['curiosity', 'inquisitive', 'exploration', 'learning mindset', 'investigation', 'research'],
      'Business Acumen': ['business acumen', 'business understanding', 'commercial awareness', 'business sense', 'market knowledge'],
      'Time Management': ['time management', 'prioritization', 'deadlines', 'organization', 'efficiency', 'productivity'],
      'Creativity': ['creativity', 'innovation', 'creative thinking', 'ideation', 'out-of-the-box thinking'],
      'Attention to Detail': ['attention to detail', 'detail-oriented', 'accuracy', 'quality control', 'precision', 'thoroughness']
    };

    Object.entries(skillPatterns).forEach(([skillName, patterns]) => {
      if (patterns.some(pattern => textLower.includes(pattern))) {
        // Check if this skill isn't already in availableSkills
        const existingSkill = availableSkills.find(s => s.name === skillName);
        if (!existingSkill) {
          extractedSkills.push({ id: Date.now(), name: skillName, category: 'detected' });
        }
      }
    });

    return extractedSkills;
  };

  const extractExperiencesFromText = (text, filename = '') => {
    const experiences = [];
    const lines = text.split('\n');
    
    console.log('First 10 lines of resume:', lines.slice(0, 10));
    console.log('All lines for debugging:', lines.map((line, i) => `${i}: "${line.trim()}"`).slice(0, 20));
    
    // First pass: Look for education
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for education section
      if (line.match(/^EDUCATION$/i)) {
        // Look for degree information in next few lines
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          const eduLine = lines[j].trim();
          
          // Look for degree pattern: "Bachelor of Arts in Political Science | Loyola Marymount University | 2017"
          if (eduLine.match(/(Bachelor|Master|PhD|B\.A\.|M\.A\.|Ph\.D\.)/i) && 
              (eduLine.includes('|') || eduLine.includes('University') || eduLine.includes('College'))) {
            
            let degree = '';
            let school = '';
            let year = '';
            
            if (eduLine.includes('|')) {
              const parts = eduLine.split('|').map(p => p.trim());
              degree = parts[0];
              school = parts[1];
              year = parts[2] || '';
            } else {
              // Try to extract degree and school from the line
              const degreeMatch = eduLine.match(/(Bachelor|Master|PhD|B\.A\.|M\.A\.|Ph\.D\.)[^|]*/i);
              const schoolMatch = eduLine.match(/(University|College|Institute|School)/i);
              const yearMatch = eduLine.match(/\b(19|20)\d{2}\b/);
              
              if (degreeMatch) degree = degreeMatch[0].trim();
              if (schoolMatch) {
                const schoolIndex = eduLine.indexOf(schoolMatch[0]);
                school = eduLine.substring(schoolIndex).trim();
              }
              if (yearMatch) year = yearMatch[0];
            }
            
            if (degree && school) {
              experiences.push({
                company: school,
                role: degree,
                period: year || 'Graduated',
                achievements: ['Academic achievement and degree completion'],
                skills: [],
                extractedFrom: 'resume'
              });
              console.log('Found education:', { school, degree, year });
              break;
            }
          }
        }
        break;
      }
    }
    
    // Second pass: Look for work experiences
    let currentCompany = '';
    let currentRole = '';
    let currentPeriod = '';
    let currentAchievements = [];
    let currentSkills = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nextLine = lines[i + 1]?.trim() || '';
      const nextNextLine = lines[i + 2]?.trim() || '';
      
      // Pattern 1: Specific company names from the resume
      if (!currentCompany && (line === 'TruConnect' || line === 'Scorpion' || line === 'TransMD')) {
        currentCompany = line;
        console.log('Found specific company:', currentCompany);
      }
      
      // Pattern 2: Company name on its own line, followed by date range
      else if (!currentCompany && line.match(/^[A-Z][a-zA-Z\s&.,]{3,40}$/) && 
          nextLine.match(/\d{4}/) && 
          (nextLine.includes('-') || nextLine.includes('to') || nextLine.includes('Present')) &&
          !line.match(/(Christina|Britz|CJ|John|Jane|Smith|Johnson|Williams|Brown|Jones|Garcia|Miller|Davis|Rodriguez|Martinez|Hernandez|Lopez|Gonzalez|Wilson|Anderson|Thomas|Taylor|Moore|Jackson|Martin|Lee|Perez|Thompson|White|Harris|Sanchez|Clark|Ramirez|Lewis|Robinson|Walker|Young|Allen|King|Wright|Scott|Torres|Nguyen|Hill|Flores|Green|Adams|Nelson|Baker|Hall|Rivera|Campbell|Mitchell|Carter|Roberts)/i) &&
          !line.match(/(Resume|CV|Curriculum Vitae|Professional Summary|Experience|Education|Skills|Contact|Phone|Email|Address|LinkedIn|Portfolio|Website|Early Wins|Key Achievements|Summary|Objective)/i)) {
        currentCompany = line;
        currentPeriod = nextLine;
        console.log('Found company by date pattern:', currentCompany, 'Period:', currentPeriod);
      }
      
      // Pattern 2: Company name on its own line, followed by role on next line
      else if (!currentCompany && line.match(/^[A-Z][a-zA-Z\s&.,]{3,40}$/) && 
               nextLine.match(/(Manager|Director|Lead|Senior|Product|Engineer|Analyst|Coordinator|Specialist|Consultant|Advisor|Executive|Officer|President|CEO|CTO|CFO|VP|Vice President|Head of|Chief|Founder)/i) &&
               !line.match(/(Christina|Britz|CJ|John|Jane|Smith|Johnson|Williams|Brown|Jones|Garcia|Miller|Davis|Rodriguez|Martinez|Hernandez|Lopez|Gonzalez|Wilson|Anderson|Thomas|Taylor|Moore|Jackson|Martin|Lee|Perez|Thompson|White|Harris|Sanchez|Clark|Ramirez|Lewis|Robinson|Walker|Young|Allen|King|Wright|Scott|Torres|Nguyen|Hill|Flores|Green|Adams|Nelson|Baker|Hall|Rivera|Campbell|Mitchell|Carter|Roberts)/i) &&
               !line.match(/(Resume|CV|Curriculum Vitae|Professional Summary|Experience|Education|Skills|Contact|Phone|Email|Address|LinkedIn|Portfolio|Website|Early Wins|Key Achievements|Summary|Objective)/i)) {
        currentCompany = line;
        currentRole = nextLine;
        console.log('Found company by role pattern:', currentCompany, 'Role:', currentRole);
      }
      
      // Pattern 3: Company name with date range on same line
      else if (!currentCompany && (line.match(/^[A-Z][a-zA-Z\s&.,]{3,40}\s+[-–—]\s+\d{4}/) || 
               line.match(/^[A-Z][a-zA-Z\s&.,]{3,40}\s+\d{4}\s*[-–—]\s*\d{4}/) ||
               line.match(/^[A-Z][a-zA-Z\s&.,]{3,40}\s+\d{4}\s*[-–—]\s*Present/))) {
        const companyMatch = line.match(/^([A-Z][a-zA-Z\s&.,]{3,40})/);
        const periodMatch = line.match(/(\d{4}\s*[-–—]\s*\d{4}|\d{4}\s*[-–—]\s*Present)/);
        
        if (companyMatch && periodMatch && 
            !companyMatch[1].match(/(Christina|Britz|CJ|John|Jane|Smith|Johnson|Williams|Brown|Jones|Garcia|Miller|Davis|Rodriguez|Martinez|Hernandez|Lopez|Gonzalez|Wilson|Anderson|Thomas|Taylor|Moore|Jackson|Martin|Lee|Perez|Thompson|White|Harris|Sanchez|Clark|Ramirez|Lewis|Robinson|Walker|Young|Allen|King|Wright|Scott|Torres|Nguyen|Hill|Flores|Green|Adams|Nelson|Baker|Hall|Rivera|Campbell|Mitchell|Carter|Roberts)/i) &&
            !companyMatch[1].match(/(Resume|CV|Curriculum Vitae|Professional Summary|Experience|Education|Skills|Contact|Phone|Email|Address|LinkedIn|Portfolio|Website|Early Wins|Key Achievements|Summary|Objective)/i)) {
          currentCompany = companyMatch[1].trim();
          currentPeriod = periodMatch[1].trim();
          console.log('Found company by inline date pattern:', currentCompany, 'Period:', currentPeriod);
        }
      }
      
      // Pattern 4: Company name with location on same line (separated by |)
      else if (!currentCompany && line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        
        if (parts.length >= 2) {
          const firstPart = parts[0];
          const secondPart = parts[1];
          
          // Check if first part looks like a company name and second part looks like a location
          if (firstPart.match(/^[A-Z][a-zA-Z\s&.,]{3,40}$/) && 
              (secondPart.includes('Los Angeles') || secondPart.includes('CA') || secondPart.includes('Personal Project') || secondPart.includes('Project')) &&
              !firstPart.match(/(Christina|Britz|CJ|John|Jane|Smith|Johnson|Williams|Brown|Jones|Garcia|Miller|Davis|Rodriguez|Martinez|Hernandez|Lopez|Gonzalez|Wilson|Anderson|Thomas|Taylor|Moore|Jackson|Martin|Lee|Perez|Thompson|White|Harris|Sanchez|Clark|Ramirez|Lewis|Robinson|Walker|Young|Allen|King|Wright|Scott|Torres|Nguyen|Hill|Flores|Green|Adams|Nelson|Baker|Hall|Rivera|Campbell|Mitchell|Carter|Roberts)/i) &&
              !firstPart.match(/(Resume|CV|Curriculum Vitae|Professional Summary|Experience|Education|Skills|Contact|Phone|Email|Address|LinkedIn|Portfolio|Website|Early Wins|Key Achievements|Summary|Objective)/i)) {
            currentCompany = firstPart;
            console.log('Found company by location pattern:', currentCompany, 'Location:', secondPart);
          }
        }
      }
      
      // Pattern 5: Company name with role on same line (separated by | or -)
      else if (!currentCompany && (line.includes('|') || line.includes(' - '))) {
        const separator = line.includes('|') ? '|' : ' - ';
        const parts = line.split(separator).map(p => p.trim());
        
        if (parts.length >= 2) {
          const firstPart = parts[0];
          const secondPart = parts[1];
          
          if (firstPart.match(/^[A-Z][a-zA-Z\s&.,]{3,40}$/) && 
              secondPart.match(/(Manager|Director|Lead|Senior|Product|Engineer|Analyst|Coordinator|Specialist|Consultant|Advisor|Executive|Officer|President|CEO|CTO|CFO|VP|Vice President|Head of|Chief|Founder)/i) &&
              !firstPart.match(/(Christina|Britz|CJ|John|Jane|Smith|Johnson|Williams|Brown|Jones|Garcia|Miller|Davis|Rodriguez|Martinez|Hernandez|Lopez|Gonzalez|Wilson|Anderson|Thomas|Taylor|Moore|Jackson|Martin|Lee|Perez|Thompson|White|Harris|Sanchez|Clark|Ramirez|Lewis|Robinson|Walker|Young|Allen|King|Wright|Scott|Torres|Nguyen|Hill|Flores|Green|Adams|Nelson|Baker|Hall|Rivera|Campbell|Mitchell|Carter|Roberts)/i) &&
              !firstPart.match(/(Resume|CV|Curriculum Vitae|Professional Summary|Experience|Education|Skills|Contact|Phone|Email|Address|LinkedIn|Portfolio|Website|Early Wins|Key Achievements|Summary|Objective)/i)) {
            currentCompany = firstPart;
            currentRole = secondPart;
            console.log('Found company by separator pattern:', currentCompany, 'Role:', currentRole);
          }
        }
      }
      
      // Look for role if we have a company but no role
      if (currentCompany && !currentRole) {
        if (line.match(/(Manager|Director|Lead|Senior|Product|Engineer|Analyst|Coordinator|Specialist|Consultant|Advisor|Executive|Officer|President|CEO|CTO|CFO|VP|Vice President|Head of|Chief|Founder)/i)) {
          currentRole = line;
          console.log('Found role:', currentRole);
        }
      }
      
      // Look for period if we have a company but no period
      if (currentCompany && !currentPeriod) {
        if (line.match(/\d{4}/) && (line.includes('-') || line.includes('to') || line.includes('Present') || line.includes('Current'))) {
          currentPeriod = line;
          console.log('Found period:', currentPeriod);
        }
      }
      
      // Detect achievement bullet points
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        const achievement = line.substring(1).trim();
        currentAchievements.push(achievement);
        
        // Extract skills from this achievement
        const achievementSkills = extractSkillsFromText(achievement);
        currentSkills.push(...achievementSkills);
      }
      
      // If we have a complete experience, save it
      if (currentCompany && currentRole && currentPeriod && currentAchievements.length > 0) {
        experiences.push({
          company: currentCompany,
          role: currentRole,
          period: currentPeriod,
          achievements: currentAchievements,
          skills: [...new Set(currentSkills.map(s => s.name))], // Remove duplicates
          extractedFrom: 'resume'
        });
        
        console.log('Created experience:', { company: currentCompany, role: currentRole });
        
        // Reset for next experience
        currentCompany = '';
        currentRole = '';
        currentPeriod = '';
        currentAchievements = [];
        currentSkills = [];
      }
    }

    // If no experiences were found but we have skills, create a fallback experience
    if (experiences.length === 0) {
      const allSkills = extractSkillsFromText(text);
      if (allSkills.length > 0) {
        experiences.push({
          company: 'Various Companies',
          role: 'Product Manager',
          period: 'Current Experience',
          achievements: ['Skills demonstrated across multiple roles and projects'],
          skills: [...new Set(allSkills.map(s => s.name))],
          extractedFrom: 'resume'
        });
      }
    }

    return experiences;
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length || !user || !supabase) return;

    setIsUploading(true);
    setIsAnalyzing(true);
    setUploadError(null);

    try {
      for (const file of files) {
        console.log(`Processing file: ${file.name}`);
        
        // Sanitize filename to avoid special character issues
        const sanitizedFileName = file.name
          .replace(/[{}[\]|:;<>?"\\/]/g, '_') // Replace problematic characters
          .replace(/\s+/g, '_') // Replace spaces with underscores
          .replace(/__+/g, '_'); // Replace multiple underscores with single
        
        // Upload to Supabase Storage
        const fileName = `${user.id}/${Date.now()}_${sanitizedFileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('files')
          .getPublicUrl(fileName);

        // Try to read file content
        let fileContent = '';
        let extractedSkills = [];
        let extractedExperiences = [];
        let confidenceScore = 0.0;

        try {
          fileContent = await readFileContent(file);
          console.log(`Read ${fileContent.length} characters from ${file.name}`);
          
          if (fileContent.length > 0) {
            extractedSkills = extractSkillsFromText(fileContent);
            extractedExperiences = extractExperiencesFromText(fileContent, file.name);
            confidenceScore = 0.8;
            
            console.log(`Extracted ${extractedSkills.length} skills and ${extractedExperiences.length} experiences from ${file.name}`);
          }
        } catch (contentError) {
          console.log(`Could not read content from ${file.name}:`, contentError);
          confidenceScore = 0.3;
        }

        // Save file metadata to database
        const { error: dbError } = await supabase
          .from('files')
          .insert({
            name: file.name,
            file_type: 'resume',
            size: `${(file.size / 1024).toFixed(1)} KB`,
            file_path: fileName,
            public_url: urlData.publicUrl,
            user_id: user.id,
            upload_date: new Date().toISOString().split('T')[0],
            content_extracted: { text: fileContent.substring(0, 2000) }, // Store first 2000 chars
            skills_identified: extractedSkills.map(s => s.name),
            experiences_identified: extractedExperiences,
            confidence_score: confidenceScore
          });

        if (dbError) throw dbError;

        // If we extracted experiences, save them to the experiences table
        if (extractedExperiences.length > 0) {
          for (const experience of extractedExperiences) {
            await saveExperience(experience);
          }
        }

              // Update user's skill profile with extracted skills
      if (extractedSkills.length > 0) {
        await updateSkillProfile(extractedSkills.map(s => s.name));
        
        // Auto-match skills to experiences based on company names
        await matchSkillsToExperiences(extractedSkills, fileContent);
        
        // Extract and merge accomplishments from resume
        console.log('Calling extractAndMergeAccomplishments...');
        await extractAndMergeAccomplishments(fileContent);
        console.log('Finished extractAndMergeAccomplishments');
      }
      }

      await loadFiles();
      await loadExperiences();
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(`Failed to upload file: ${error.message}`);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const saveExperience = async (experience) => {
    if (!user || !supabase) return;

    try {
      const { error } = await supabase
        .from('experiences')
        .upsert({
          user_id: user.id,
          company: experience.company,
          role: experience.role,
          period: experience.period,
          skills_with_evidence: experience.skills.map(skill => ({
            skill: skill,
            evidence: `Extracted from resume content`,
            impact: '',
            added_date: new Date().toISOString()
          })),
          extracted_from: [experience.extractedFrom || 'resume'],
          is_merged: false
        });

      if (error) throw error;
      console.log(`Saved experience: ${experience.company} - ${experience.role}`);
    } catch (error) {
      console.error('Error saving experience:', error);
    }
  };

  const matchSkillsToExperiences = async (extractedSkills, resumeText) => {
    if (!user || !supabase) return;

    try {
      // Get all user experiences
      const { data: userExperiences, error: fetchError } = await supabase
        .from('experiences')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      // For each experience, find skills mentioned near the company name
      for (const experience of userExperiences) {
        const companyName = experience.company.toLowerCase();
        const relevantSkills = [];
        
        // Look for skills mentioned in the same paragraph/section as the company
        const lines = resumeText.split('\n');
        let inCompanySection = false;
        let companySectionText = '';
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].toLowerCase();
          
          // Check if we're entering a section with this company
          if (line.includes(companyName) || 
              (companyName === 'truconnect' && line.includes('truconnect')) ||
              (companyName === 'scorpion' && line.includes('scorpion')) ||
              (companyName === 'transmd' && line.includes('transmd'))) {
            inCompanySection = true;
            companySectionText = '';
          }
          
          // Collect text while in company section
          if (inCompanySection) {
            companySectionText += ' ' + lines[i];
            
            // Check if we've moved to next company (look for next company pattern)
            if (i < lines.length - 1) {
              const nextLine = lines[i + 1].toLowerCase();
              if ((nextLine.includes('truconnect') && companyName !== 'truconnect') ||
                  (nextLine.includes('scorpion') && companyName !== 'scorpion') ||
                  (nextLine.includes('transmd') && companyName !== 'transmd') ||
                  nextLine.includes('education') ||
                  nextLine.includes('professional experience')) {
                inCompanySection = false;
              }
            }
          }
        }
        
        // Find skills mentioned in this company's section
        extractedSkills.forEach(skill => {
          if (companySectionText.toLowerCase().includes(skill.name.toLowerCase())) {
            relevantSkills.push({
              skill: skill.name,
              evidence: `Extracted from ${experience.company} section in resume`,
              impact: ''
            });
          }
        });
        
        // Update experience with matched skills
        if (relevantSkills.length > 0) {
          const updatedSkills = [
            ...(experience.skills_with_evidence || []),
            ...relevantSkills
          ].filter(
            (skill, index, self) =>
              self.findIndex(s => s.skill === skill.skill) === index
          );
          
          const { error: updateError } = await supabase
            .from('experiences')
            .update({ skills_with_evidence: updatedSkills })
            .eq('id', experience.id);
            
          if (updateError) throw updateError;
          
          console.log(`Matched ${relevantSkills.length} skills to ${experience.company}`);
        }
      }
      
      // Reload experiences to show updated data
      await loadExperiences();
      
    } catch (error) {
      console.error('Error matching skills to experiences:', error);
    }
  };

  const extractAccomplishmentsFromText = (text) => {
    const accomplishments = [];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for bullet points that contain accomplishments
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        const accomplishment = line.substring(1).trim();
        
        // Filter out non-accomplishment bullets (like contact info, etc.)
        if (accomplishment.length > 10 && 
            !accomplishment.includes('@') && 
            !accomplishment.includes('www.') &&
            !accomplishment.includes('phone') &&
            !accomplishment.includes('email')) {
          accomplishments.push(accomplishment);
        }
      }
    }
    
    return accomplishments;
  };

  const extractAndMergeAccomplishments = async (resumeText) => {
    if (!user || !supabase) return;

    console.log('Starting accomplishment extraction...');
    console.log('Resume text length:', resumeText.length);

    try {
      // Get all user experiences
      const { data: userExperiences, error: fetchError } = await supabase
        .from('experiences')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;
      
      console.log('Found user experiences:', userExperiences?.length || 0);

      // For each experience, find accomplishments in the company's section
      for (const experience of userExperiences) {
        const companyName = experience.company.toLowerCase();
        const companyAccomplishments = [];
        
        console.log(`Processing company: ${experience.company}`);
        
        // Look for accomplishments in the same paragraph/section as the company
        const lines = resumeText.split('\n');
        let inCompanySection = false;
        let companySectionText = '';
        
        console.log(`Looking for company: "${experience.company}" (lowercase: "${companyName}")`);
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].toLowerCase();
          
          // Check if we're entering a section with this company
          if (line.includes(companyName) || 
              (companyName === 'truconnect' && line.includes('truconnect')) ||
              (companyName === 'scorpion' && line.includes('scorpion')) ||
              (companyName === 'transmd' && line.includes('transmd'))) {
            inCompanySection = true;
            companySectionText = '';
            console.log(`Found company section at line ${i}: "${lines[i]}"`);
          }
          
          // Collect text while in company section
          if (inCompanySection) {
            companySectionText += ' ' + lines[i];
            
            // Check if we've moved to next company (look for next company pattern)
            if (i < lines.length - 1) {
              const nextLine = lines[i + 1].toLowerCase();
              if ((nextLine.includes('truconnect') && companyName !== 'truconnect') ||
                  (nextLine.includes('scorpion') && companyName !== 'scorpion') ||
                  (nextLine.includes('transmd') && companyName !== 'transmd') ||
                  nextLine.includes('education') ||
                  nextLine.includes('professional experience')) {
                inCompanySection = false;
              }
            }
          }
        }
        
        console.log(`Company section text for ${experience.company}:`, companySectionText.substring(0, 200) + '...');
        
        // Extract bullet points from this company's section
        // First, try to find complete sentences and phrases
        const sentences = companySectionText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        console.log(`Processing ${sentences.length} sentences in company section`);
        
        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i].trim();
          console.log(`Sentence ${i}: "${sentence}"`);
          
          // Look for sentences that look like accomplishments
          if (sentence.length > 20 && 
              sentence.length < 300 &&
              !sentence.includes('@') && 
              !sentence.includes('www.') &&
              !sentence.includes('phone') &&
              !sentence.includes('email') &&
              !sentence.includes('|') &&
              !sentence.match(/^\d{4}/) && // Doesn't start with year
              !sentence.match(/^[A-Z][a-z]+ \d{4}/) && // Doesn't start with month year
              sentence.match(/[a-z]/) && // Contains lowercase letters
              !sentence.match(/^(TruConnect|Scorpion|TransMD|Los Angeles|Founder|Product Manager|Director|SKILLS|CONTACT|AWARDS)/i) && // Not headers
              !sentence.match(/^(Present|BA|GPA|linkedin|www)/i)) { // Not contact info
            console.log(`Found accomplishment sentence: "${sentence}"`);
            companyAccomplishments.push(sentence);
          }
        }
        
        // Also look for bullet-point style accomplishments
        const bulletPatterns = companySectionText.match(/[•\-*–—·●▪‣◦❖❥❧➤➔➣➢➥➦➧➨➩➪➫➬➭➮➯➱➲➳➵➸➺➻➼➽➾]\s*([^•\-*–—·●▪‣◦❖❥❧➤➔➣➢➥➦➧➨➩➪➫➬➭➮➯➱➲➳➵➸➺➻➼➽➾]+)/g);
        if (bulletPatterns) {
          bulletPatterns.forEach(pattern => {
            const accomplishment = pattern.replace(/^[•\-*–—·●▪‣◦❖❥❧➤➔➣➢➥➦➧➨➩➪➫➬➭➮➯➱➲➳➵➸➺➻➼➽➾]\s*/, '').trim();
            if (accomplishment.length > 20 && 
                accomplishment.length < 300 &&
                !accomplishment.includes('@') && 
                !accomplishment.includes('www.') &&
                !accomplishment.includes('phone') &&
                !accomplishment.includes('email') &&
                !accomplishment.match(/^(TruConnect|Scorpion|TransMD|Los Angeles|Founder|Product Manager|Director|SKILLS|CONTACT|AWARDS)/i)) {
              console.log(`Found bullet accomplishment: "${accomplishment}"`);
              companyAccomplishments.push(accomplishment);
            }
          });
        }
        
        console.log(`Found ${companyAccomplishments.length} accomplishments for ${experience.company}`);
        
        // Merge with existing accomplishments (avoid duplicates)
        if (companyAccomplishments.length > 0) {
          // Get existing accomplishments for this experience
          const { data: existingAccomplishments, error: fetchError } = await supabase
            .from('accomplishments')
            .select('description')
            .eq('experience_id', experience.id);
            
          if (fetchError) throw fetchError;
          
          const existingDescriptions = existingAccomplishments?.map(acc => acc.description.toLowerCase().trim()) || [];
          
          // Add new accomplishments that aren't already there
          const newAccomplishments = [];
          companyAccomplishments.forEach(accomplishment => {
            const normalizedAccomplishment = accomplishment.toLowerCase().trim();
            const isDuplicate = existingDescriptions.includes(normalizedAccomplishment);
            
            if (!isDuplicate) {
              newAccomplishments.push({
                experience_id: experience.id,
                description: accomplishment.trim(),
                category: 'general',
                tags: []
              });
            }
          });
          
          // Insert new accomplishments
          if (newAccomplishments.length > 0) {
            console.log('About to insert accomplishments:', newAccomplishments);
            const { error: insertError } = await supabase
              .from('accomplishments')
              .insert(newAccomplishments);
            if (insertError) {
              console.error('Error inserting accomplishments:', insertError);
            } else {
              console.log(`Added ${newAccomplishments.length} new accomplishments to ${experience.company}`);
            }
          }
        }
      }
      
      // Reload experiences to show updated data
      await loadExperiences();
      
    } catch (error) {
      console.error('Error extracting and merging accomplishments:', error);
    }
  };

  const updateSkillProfile = async (newSkills) => {
    if (!user || !supabase) return;

    try {
      // First, get existing skill profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('skill_profiles')
        .select('skills')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching skill profile:', fetchError);
        // Continue with fallback - don't throw error
        return;
      }

      // Merge existing skills with new skills
      const existingSkills = existingProfile?.skills || {};
      const updatedSkills = { ...existingSkills };

      // Add new skills with default evidence
      newSkills.forEach(skill => {
        if (!updatedSkills[skill]) {
          updatedSkills[skill] = {
            evidence: `Extracted from uploaded resume`,
            impact: '',
            added_date: new Date().toISOString()
          };
        }
      });

      // Use upsert with onConflict to handle conflicts
      const { error: upsertError } = await supabase
        .from('skill_profiles')
        .upsert({
          user_id: user.id,
          skills: updatedSkills
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        console.error('Error upserting skill profile:', upsertError);
        // Continue without throwing error
        return;
      }
      
      console.log(`Updated skill profile with ${newSkills.length} new skills`);
    } catch (error) {
      console.error('Error updating skill profile:', error);
      // Don't throw error - just log and continue
    }
  };

  const addExperience = async () => {
    if (!newExperience.company || !newExperience.role || !newExperience.period) return;

    try {
      // First, insert the experience
      const { data: experienceData, error: experienceError } = await supabase
        .from('experiences')
        .insert({
          user_id: user.id,
          company: newExperience.company,
          role: newExperience.role,
          period: newExperience.period,
          type: newExperience.type,
          skills_with_evidence: newExperience.skills.map(skill => ({
            skill: skill,
            evidence: `Added from ${newExperience.company} experience`,
            impact: ''
          })),
          extracted_from: ['manual'],
          is_merged: false
        })
        .select()
        .single();

      if (experienceError) throw experienceError;

      // Then, insert accomplishments if any
      if (newExperience.achievements.length > 0) {
        const accomplishments = newExperience.achievements
          .filter(a => a.trim())
          .map(description => ({
            experience_id: experienceData.id,
            description: description.trim(),
            category: 'general',
            tags: []
          }));

        if (accomplishments.length > 0) {
          const { error: accomplishmentsError } = await supabase
            .from('accomplishments')
            .insert(accomplishments);

          if (accomplishmentsError) throw accomplishmentsError;
        }
      }

      setNewExperience({
        company: '',
        role: '',
        period: '',
        type: 'job',
        achievements: [''],
        skills: []
      });
      setShowAddExperienceModal(false);
      await loadExperiences();
    } catch (error) {
      console.error('Error adding experience:', error);
    }
  };

  const addSkillToExperience = async () => {
    if (!selectedExperience || !newSkill.skill.trim()) return;

    try {
      const updatedExperience = {
        ...selectedExperience,
        skills_with_evidence: [
          ...selectedExperience.skills_with_evidence,
          {
            skill: newSkill.skill,
            evidence: newSkill.evidence,
            impact: newSkill.impact
          }
        ]
      };

      const { error } = await supabase
        .from('experiences')
        .update({
          skills_with_evidence: updatedExperience.skills_with_evidence
        })
        .eq('id', selectedExperience.id);

      if (error) throw error;

      setExperiences(prev => 
        prev.map(exp => 
          exp.id === selectedExperience.id ? updatedExperience : exp
        )
      );

      setShowAddSkillModal(false);
      setSelectedExperience(null);
      setNewSkill({ skill: '', evidence: '', impact: '' });
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const removeSkill = async (experienceId, skillIndex) => {
    try {
      const experience = experiences.find(exp => exp.id === experienceId);
      const updatedSkills = experience.skills_with_evidence.filter((_, index) => index !== skillIndex);

      const { error } = await supabase
        .from('experiences')
        .update({ skills_with_evidence: updatedSkills })
        .eq('id', experienceId);

      if (error) throw error;

      setExperiences(prev => 
        prev.map(exp => 
          exp.id === experienceId 
            ? { ...exp, skills_with_evidence: updatedSkills }
            : exp
        )
      );
    } catch (error) {
      console.error('Error removing skill:', error);
    }
  };

  const addAchievement = () => {
    setNewExperience(prev => ({
      ...prev,
      achievements: [...prev.achievements, '']
    }));
  };

  const updateAchievement = (index, value) => {
    setNewExperience(prev => ({
      ...prev,
      achievements: prev.achievements.map((achievement, i) => 
        i === index ? value : achievement
      )
    }));
  };

  const removeAchievement = (index) => {
    setNewExperience(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const deleteFile = async (fileId, fileName) => {
    if (!user || !supabase) return;

    // Show custom delete modal
    setFileToDelete({ id: fileId, name: fileName });
    setShowDeleteModal(true);
  };

  const confirmDeleteFile = async () => {
    if (!user || !supabase || !fileToDelete) return;

    try {
      // First, manually delete related experiences
      const { error: experienceError } = await supabase
        .from('experiences')
        .delete()
        .eq('user_id', user.id)
        .contains('extracted_from', [fileToDelete.name]);

      if (experienceError) {
        console.error('Error deleting related experiences:', experienceError);
      }

      // Also clean up any skills from skill_profiles that came from this file
      try {
        // Get the skills that were identified from this file BEFORE deleting it
        const { data: fileData } = await supabase
          .from('files')
          .select('skills_identified')
          .eq('id', fileToDelete.id)
          .single();

        if (fileData && fileData.skills_identified && fileData.skills_identified.length > 0) {
          const { data: currentProfile, error: fetchError } = await supabase
            .from('skill_profiles')
            .select('skills')
            .eq('user_id', user.id)
            .single();

          if (!fetchError && currentProfile && currentProfile.skills) {
            // Remove skills that came from this file
            const updatedSkills = { ...currentProfile.skills };
            fileData.skills_identified.forEach(skill => {
              delete updatedSkills[skill];
            });

            // Update the skill profile
            const { error: updateError } = await supabase
              .from('skill_profiles')
              .update({ skills: updatedSkills })
              .eq('user_id', user.id);

            if (updateError) {
              console.error('Error updating skill profile:', updateError);
            }
          }
        }
      } catch (skillError) {
        console.error('Error cleaning up skills:', skillError);
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([fileToDelete.name]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
      }

      // Finally, delete the file record
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileToDelete.id)
        .eq('user_id', user.id);

      if (dbError) {
        console.error('Error deleting from database:', dbError);
        return;
      }

      console.log(`Deleted file: ${fileToDelete.name}`);
      
      // Reload files and experiences
      await loadFiles();
      await loadExperiences();
      
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      // Close modal and reset
      setShowDeleteModal(false);
      setFileToDelete(null);
    }
  };

  const deleteExperience = async (experience) => {
    setExperienceToDelete(experience);
    setShowDeleteExperienceModal(true);
  };

  const confirmDeleteExperience = async () => {
    if (!user || !supabase || !experienceToDelete) return;

    try {
      // Delete the experience
      const { error: experienceError } = await supabase
        .from('experiences')
        .delete()
        .eq('id', experienceToDelete.id)
        .eq('user_id', user.id);

      if (experienceError) {
        console.error('Error deleting experience:', experienceError);
        return;
      }

      console.log(`Deleted experience: ${experienceToDelete.company} - ${experienceToDelete.role}`);
      
      // Reload experiences
      await loadExperiences();
      
    } catch (error) {
      console.error('Error deleting experience:', error);
    } finally {
      // Close modal and reset
      setShowDeleteExperienceModal(false);
      setExperienceToDelete(null);
    }
  };

  const toggleSkill = (skill) => {
    setNewExperience(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const nextExperience = () => {
    if (currentExperienceIndex < experiences.length - 1) {
      setCurrentExperienceIndex(currentExperienceIndex + 1);
    }
  };

  const prevExperience = () => {
    if (currentExperienceIndex > 0) {
      setCurrentExperienceIndex(currentExperienceIndex - 1);
    }
  };

  // Group skills by category for display
  const skillsByCategory = availableSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const getSkillCategoryColor = (category) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'product': return 'bg-green-100 text-green-800 border-green-300';
      case 'leadership': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'domain': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'soft': return 'bg-pink-100 text-pink-800 border-pink-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSkillCategory = (skillName) => {
    // This would ideally come from the skills database
    return 'product'; // Default category
  };

  const getExperienceTypeLabels = (type) => {
    switch (type) {
      case 'job':
        return { company: 'Company', role: 'Role', period: 'Period' };
      case 'project':
        return { company: 'Project Name', role: 'Role/Position', period: 'Duration' };
      case 'volunteer':
        return { company: 'Organization', role: 'Role/Position', period: 'Duration' };
      case 'education':
        return { company: 'Institution', role: 'Degree/Program', period: 'Graduation Date' };
      default:
        return { company: 'Company', role: 'Role', period: 'Period' };
    }
  };

  const getExperienceTypeColor = (type) => {
    switch (type) {
      case 'job':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'project':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'volunteer':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'education':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Drag and drop functions for reordering experiences
  const handleDragStart = (e, experience) => {
    console.log('🚀 DRAG START:', experience.company);
    setDraggedExperience(experience);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', experience.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const targetElement = e.currentTarget;
    const experienceId = targetElement.dataset.experienceId;
    
    // Debug: log what we're getting
    console.log('🎯 DRAG OVER DEBUG:', {
      experienceId,
      dataset: targetElement.dataset,
      className: targetElement.className
    });
    
    if (!experienceId) {
      console.log('❌ No experience ID found on target element');
      return;
    }
    
    const targetIndex = experiences.findIndex(exp => exp.id === experienceId);
    
    // Always set drag over index when we have a dragged experience and it's different
    if (draggedExperience && draggedExperience.id !== experienceId) {
      console.log(`🎯 DRAG OVER: ${draggedExperience.company} -> ${experiences[targetIndex]?.company} (index: ${targetIndex})`);
      setDragOverIndex(targetIndex);
    }
  };

  const handleDrop = async (e, targetExperience) => {
    e.preventDefault();
    
    if (!draggedExperience || draggedExperience.id === targetExperience.id) {
      setDraggedExperience(null);
      setDragOverIndex(null);
      return;
    }

    try {
      const draggedIndex = experiences.findIndex(exp => exp.id === draggedExperience.id);
      const targetIndex = experiences.findIndex(exp => exp.id === targetExperience.id);
      
      if (draggedIndex === -1 || targetIndex === -1) return;

      // Create new array with reordered experiences
      const newExperiences = [...experiences];
      const [draggedItem] = newExperiences.splice(draggedIndex, 1);
      newExperiences.splice(targetIndex, 0, draggedItem);
      
      setExperiences(newExperiences);
      console.log(`Moved ${draggedExperience.company} to position ${targetIndex}`);
      
      // Update the database with new order
      const updatePromises = newExperiences.map((exp, index) => 
        supabase
          .from('experiences')
          .update({ display_order: index })
          .eq('id', exp.id)
      );
      
      await Promise.all(updatePromises);
      console.log('✅ Database updated with new order');
      
    } catch (error) {
      console.error('Error reordering experiences:', error);
    } finally {
      setDraggedExperience(null);
      setDragOverIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedExperience(null);
    setDragOverIndex(null);
    
    // Reset opacity of all elements
    document.querySelectorAll('[data-experience-id]').forEach(el => {
      el.style.opacity = '1';
    });
  };

  // Master Profile View Component
  const MasterProfileView = () => {
    if (experiences.length === 0) {
      return (
        <div className="text-center py-12">
          <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Experiences Found</h3>
          <p className="text-gray-600 mb-4">Upload resumes to build your master profile</p>
          <button
            onClick={() => setShowMasterProfile(false)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Upload
          </button>
        </div>
      );
    }

    const currentExperience = experiences[currentExperienceIndex];

    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Master Profile</h2>
          <p className="text-gray-600">Your professional experience and skills</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevExperience}
            disabled={currentExperienceIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>
          
          <div className="text-center">
            <span className="text-sm text-gray-500">
              Experience {currentExperienceIndex + 1} of {experiences.length}
            </span>
          </div>
          
          <button
            onClick={nextExperience}
            disabled={currentExperienceIndex === experiences.length - 1}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Experience Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          {/* Company & Role Header */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{currentExperience.company}</h3>
            <p className="text-xl text-gray-600 mb-1">{currentExperience.role}</p>
            <p className="text-gray-500">{currentExperience.period}</p>
          </div>

          {/* Achievements */}
          {currentExperience.achievements && currentExperience.achievements.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Key Achievements</h4>
              <ul className="space-y-2">
                {currentExperience.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {currentExperience.skills_with_evidence && currentExperience.skills_with_evidence.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Skills Demonstrated</h4>
              <div className="flex flex-wrap gap-2">
                {currentExperience.skills_with_evidence?.map((skillData, index) => (
                  <div
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm border ${getSkillCategoryColor(getSkillCategory(skillData.skill))}`}
                  >
                    {skillData.skill}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => setShowMasterProfile(false)}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Back to Profile Builder
          </button>
        </div>
      </div>
    );
  };

  // Main Component Render
  if (showMasterProfile) {
    return <MasterProfileView />;
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Enhanced Profile Builder</h2>
        <p className="text-gray-600">Upload resumes to automatically extract skills and experiences</p>
      </div>

      {/* Master Profile Button */}
      {experiences.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => setShowMasterProfile(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2 mx-auto"
          >
            <UserCheck className="w-5 h-5" />
            <span>View Master Profile</span>
          </button>
        </div>
      )}

      {/* File Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Documents</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isUploading ? 'Uploading and analyzing...' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Upload resumes (DOCX, TXT) to automatically extract skills and experiences
          </p>
          <p className="text-xs text-gray-400 mb-4">
            For PDF files, please convert to DOCX format first
          </p>
          {isAnalyzing && (
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-blue-600">Analyzing content...</span>
            </div>
          )}
          <input
            type="file"
            multiple
            accept=".docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer disabled:bg-gray-400"
          >
            {isUploading ? 'Uploading...' : 'Choose Files'}
          </label>
        </div>

        {uploadError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{uploadError}</span>
            </div>
          </div>
        )}
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Uploaded Documents</h3>
            <button
              onClick={() => setShowFilesList(!showFilesList)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span className="text-sm font-medium">
                {files.length} document{files.length !== 1 ? 's' : ''}
              </span>
              {showFilesList ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
          
          {showFilesList && (
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {file.file_type} • {file.size} • {file.upload_date}
                      </p>
                      {file.skills_identified && file.skills_identified.length > 0 && (
                        <p className="text-sm text-green-600">
                          {file.skills_identified.length} skills extracted
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteFile(file.id, file.name)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Experience Profile */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Experience Profile</h3>
          <button
            onClick={() => setShowAddExperienceModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Experience</span>
          </button>
        </div>
        
        {!isLoading && experiences.length === 0 ? (
          <div className="text-center py-8">
            <BriefcaseIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">No experiences found yet</p>
            <p className="text-sm text-gray-400 mb-4">Upload resumes to automatically extract experiences, or add them manually</p>
            <button
              onClick={() => setShowAddExperienceModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Experience Manually
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {experiences.map((experience, index) => {
              const isDragging = draggedExperience?.id === experience.id;
              const isDragOver = dragOverIndex === index;
              const draggedIndex = experiences.findIndex(exp => exp.id === draggedExperience?.id);
              
              // Calculate visual position shift for other cards
              let transformY = 0;
              let isShifted = false;
              
              if (draggedExperience && !isDragging) {
                if (draggedIndex < index && isDragOver) {
                  // Card is being dragged down, shift this card up to make space
                  transformY = -150;
                  isShifted = true;
                  console.log(`📈 SHIFTING UP: ${experience.company} by ${transformY}px`);
                } else if (draggedIndex > index && isDragOver) {
                  // Card is being dragged up, shift this card down to make space
                  transformY = 150;
                  isShifted = true;
                  console.log(`📉 SHIFTING DOWN: ${experience.company} by ${transformY}px`);
                }
              }
              
              return (
                <div key={experience.id}>
                  {/* Visual placeholder for dragged card above */}
                  {isDragOver && draggedIndex > index && (
                    <div className="h-40 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl mb-4 border-4 border-dashed border-blue-500 flex items-center justify-center animate-pulse">
                      <div className="text-center">
                        <div className="text-blue-800 font-bold text-xl mb-2">⬇️ DROP {draggedExperience?.company} HERE ⬇️</div>
                        <div className="text-blue-700 text-base">This card will be inserted at this position</div>
                      </div>
                    </div>
                  )}
                  
                  <div 
                    data-experience-id={experience.id}
                    className={`border-2 rounded-lg p-4 transition-all duration-300 ease-out ${
                    isDragging 
                      ? 'opacity-30 bg-gray-100 border-gray-300 shadow-lg' 
                      : isDragOver 
                      ? 'border-green-500 bg-green-50 shadow-xl scale-105' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  style={{
                    transform: `translateY(${transformY}px)`,
                    zIndex: isDragging ? 1000 : isDragOver ? 100 : 1,
                    backgroundColor: isShifted ? '#fef3c7' : isDragOver ? '#dcfce7' : undefined,
                    borderColor: isDragOver ? '#16a34a' : undefined,
                    boxShadow: isShifted ? '0 10px 25px rgba(0,0,0,0.2)' : isDragOver ? '0 8px 20px rgba(0,0,0,0.15)' : undefined
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, experience)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, experience)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1 group/drag">
                        <GripVertical 
                          className={`w-5 h-5 transition-colors ${
                            isDragging ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                          } cursor-grab active:cursor-grabbing`} 
                          title="Drag to reorder"
                        />
                        <div className="absolute left-0 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/drag:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          Drag to reorder
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-800">{experience.company}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getExperienceTypeColor(experience.type || 'job')}`}>
                            {experience.type === 'job' ? 'Job' : 
                             experience.type === 'project' ? 'Project' : 
                             experience.type === 'volunteer' ? 'Volunteer' : 
                             experience.type === 'education' ? 'Education' : 'Job'}
                          </span>
                        </div>
                        <p className="text-gray-600">{experience.role}</p>
                        <p className="text-sm text-gray-500">{experience.period}</p>
                      </div>
                    </div>
                    
                    {/* Drag indicator */}
                    {isDragging && (
                      <div className="flex-shrink-0 ml-2">
                        <div className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full font-bold animate-pulse">
                          🚀 DRAGGING...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Accomplishments */}
                  {experience.achievements && experience.achievements.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-700 mb-2">Key Accomplishments</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {experience.achievements.map((achievement, index) => (
                          <li key={index}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Skills with Evidence */}
                  <div className="mb-3">
                    <h5 className="font-medium text-gray-700 mb-2">Skills & Evidence</h5>
                    <div className="flex flex-wrap gap-2">
                      {experience.skills_with_evidence?.map((skillData, index) => (
                        <div key={index} className="group relative">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm ${getSkillCategoryColor(getSkillCategory(skillData.skill))} hover:shadow-sm transition-shadow`}>
                            {skillData.skill}
                            <button
                              onClick={() => removeSkill(experience.id, index)}
                              className="ml-2 p-0.5 text-gray-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                          <div className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {skillData.evidence}
                            {skillData.impact && ` • ${skillData.impact}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedExperience(experience);
                        setShowAddSkillModal(true);
                      }}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Skill</span>
                    </button>
                    
                    <button
                      onClick={() => deleteExperience(experience)}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Experience</span>
                    </button>
                  </div>
                  
                  {/* Visual placeholder for dragged card below */}
                  {isDragOver && draggedIndex < index && (
                    <div className="h-40 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl mt-4 border-4 border-dashed border-blue-500 flex items-center justify-center animate-pulse">
                      <div className="text-center">
                        <div className="text-blue-800 font-bold text-xl mb-2">⬆️ DROP {draggedExperience?.company} HERE ⬆️</div>
                        <div className="text-blue-700 text-base">This card will be inserted at this position</div>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Experience Modal */}
      {showAddExperienceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add Experience</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Type</label>
                <select
                  value={newExperience.type}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="job">Job/Employment</option>
                  <option value="project">Personal Project</option>
                  <option value="volunteer">Volunteer Work</option>
                  <option value="education">Education</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getExperienceTypeLabels(newExperience.type).company}
                  </label>
                  <input
                    type="text"
                    value={newExperience.company}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={
                      newExperience.type === 'job' ? 'e.g., TruConnect' :
                      newExperience.type === 'project' ? 'e.g., AI Resume Tool' :
                      newExperience.type === 'volunteer' ? 'e.g., Local Food Bank' :
                      'e.g., Loyola Marymount University'
                    }
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getExperienceTypeLabels(newExperience.type).role}
                  </label>
                  <input
                    type="text"
                    value={newExperience.role}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={
                      newExperience.type === 'job' ? 'e.g., Director of Product Management' :
                      newExperience.type === 'project' ? 'e.g., Full Stack Developer' :
                      newExperience.type === 'volunteer' ? 'e.g., Board Member' :
                      'e.g., Bachelor of Arts in Political Science'
                    }
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getExperienceTypeLabels(newExperience.type).period}
                </label>
                <input
                  type="text"
                  value={newExperience.period}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, period: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={
                    newExperience.type === 'job' ? 'e.g., January 2023 - Present' :
                    newExperience.type === 'project' ? 'e.g., 3 months' :
                    newExperience.type === 'volunteer' ? 'e.g., 2 years' :
                    'e.g., 2017'
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Accomplishments</label>
                <div className="space-y-2">
                  {newExperience.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => updateAchievement(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g., Led 250% revenue growth"
                      />
                      <button
                        onClick={() => removeAchievement(index)}
                        className="px-2 py-2 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addAchievement}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add accomplishment
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="space-y-3">
                  {Object.entries(skillsByCategory).map(([category, skills]) => (
                    <div key={category}>
                      <h4 className="font-medium text-gray-700 mb-2 capitalize">{category} Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <button
                            key={skill.id}
                            onClick={() => toggleSkill(skill.name)}
                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                              newExperience.skills.includes(skill.name)
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            {skill.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={addExperience}
                disabled={!newExperience.company || !newExperience.role || !newExperience.period}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Experience
              </button>
              <button
                onClick={() => {
                  setShowAddExperienceModal(false);
                  setNewExperience({
                    company: '',
                    role: '',
                    period: '',
                    type: 'job',
                    achievements: [''],
                    skills: []
                  });
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Skill to {selectedExperience?.company}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
                <select
                  value={newSkill.skill}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, skill: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select a skill</option>
                  {Object.entries(skillsByCategory).map(([category, skills]) => (
                    <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                      {skills.map((skill) => (
                        <option key={skill.id} value={skill.name}>{skill.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evidence</label>
                <textarea
                  value={newSkill.evidence}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, evidence: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows="3"
                  placeholder="Describe how you demonstrated this skill..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impact (Optional)</label>
                <input
                  type="text"
                  value={newSkill.impact}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, impact: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., 250% revenue growth"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={addSkillToExperience}
                disabled={!newSkill.skill.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Skill
              </button>
              <button
                onClick={() => {
                  setShowAddSkillModal(false);
                  setSelectedExperience(null);
                  setNewSkill({ skill: '', evidence: '', impact: '' });
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete File Modal */}
      {showDeleteModal && fileToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Icon */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              </div>
            </div>
            
            {/* Title */}
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center mb-3 sm:mb-4">
              Delete Resume
            </h3>
            
            {/* Message */}
            <div className="text-center mb-4 sm:mb-6">
              <p className="text-gray-600 mb-2 text-sm sm:text-base">
                Are you sure you want to delete
              </p>
              <p className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base break-words">
                "{fileToDelete.name}"?
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                This will also remove any experiences and skills extracted from this file.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setFileToDelete(null);
                }}
                className="w-full sm:flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                className="w-full sm:flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Experience Modal */}
      {showDeleteExperienceModal && experienceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Icon */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              </div>
            </div>
            
            {/* Title */}
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center mb-3 sm:mb-4">
              Delete Experience
            </h3>
            
            {/* Message */}
            <div className="text-center mb-4 sm:mb-6">
              <p className="text-gray-600 mb-2 text-sm sm:text-base">
                Are you sure you want to delete this experience?
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {experienceToDelete.company}
                </p>
                <p className="text-gray-600 text-sm">
                  {experienceToDelete.role}
                </p>
                <p className="text-gray-500 text-xs">
                  {experienceToDelete.period}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                This will permanently remove this experience and all associated accomplishments.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setShowDeleteExperienceModal(false);
                  setExperienceToDelete(null);
                }}
                className="w-full sm:flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteExperience}
                className="w-full sm:flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base"
              >
                Delete Experience
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedProfileBuilder; 