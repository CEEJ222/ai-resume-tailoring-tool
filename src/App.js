import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, Zap, Target, Award, Users, Settings, Database, BookOpen, User, Briefcase, FileImage, Trash2, Edit, Plus, TrendingUp, CheckCircle, AlertCircle, BarChart3, AlertTriangle, LogOut } from 'lucide-react';
import './App.css';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import CompanySearch from './components/CompanySearch';
import ResumeOutput from './components/ResumeOutput';
import EnhancedProfileBuilder from './components/EnhancedProfileBuilder';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('generate');
  const [jobDescription, setJobDescription] = useState('');
  const [generatedResume, setGeneratedResume] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  

  
  const [skills, setSkills] = useState([]);
  const [skillProfile, setSkillProfile] = useState({
    technical: ['React', 'HTML/CSS/JS', 'SQL', 'API Integration', 'Mobile Development', 'Oracle ARCS'],
    product: ['Product Strategy', 'Roadmapping', 'A/B Testing', 'User Research', 'Agile/Scrum'],
    leadership: ['Cross-functional Teams', 'Vendor Management', 'Stakeholder Alignment', 'P&L Ownership'],
    domain: ['SaaS', 'eCommerce', 'Healthcare', 'Telecom', 'Compliance', 'Mobile Apps']
  });
  const [skillProfileLoading, setSkillProfileLoading] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [experiencesLoading, setExperiencesLoading] = useState(false);

  // NEW: Application Tracking for JTBD "Maintain consistency across applications"
  const [applications, setApplications] = useState([
    {
      id: 1,
      company: 'Netflix',
      companyData: {
        name: 'Netflix',
        domain: 'netflix.com',
        industry: 'Entertainment',
        location: 'Los Gatos, CA',
        employees: '12,000+',
        description: 'Streaming entertainment service',
        logo: 'https://logo.clearbit.com/netflix.com'
      },
      role: 'Senior Product Manager',
      date: '2024-01-20',
      status: 'Interview Scheduled',
      resumeVersion: 'Netflix-Senior-PM-v1',
      keyEmphasis: ['Mobile Product Strategy', 'Revenue Growth', 'User Experience'],
      matchScore: 87,
      feedback: 'Strong mobile experience, good revenue metrics'
    },
    {
      id: 2,
      company: 'Uber',
      companyData: {
        name: 'Uber',
        domain: 'uber.com',
        industry: 'Transportation',
        location: 'San Francisco, CA',
        employees: '32,000+',
        description: 'Ride-sharing and delivery platform',
        logo: 'https://logo.clearbit.com/uber.com'
      },
      role: 'Product Manager',
      date: '2024-01-18',
      status: 'Applied',
      resumeVersion: 'Uber-PM-v1',
      keyEmphasis: ['Platform Architecture', 'Growth Strategy', 'Cross-functional Leadership'],
      matchScore: 92,
      feedback: 'Excellent platform experience, strong leadership'
    }
  ]);

  // New application form state
  const [showAddApplication, setShowAddApplication] = useState(false);
  const [newApplication, setNewApplication] = useState({
    company: '',
    companyData: null,
    role: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Applied',
    resumeVersion: '',
    keyEmphasis: [''],
    matchScore: 0,
    feedback: ''
  });

  // NEW: Skill Gap Analysis for JTBD "Identify skill development priorities"
  const [skillGaps, setSkillGaps] = useState([
    {
      skill: 'Machine Learning',
      frequency: 15,
      impact: 'High',
      priority: 'High',
      learningPath: 'Coursera ML Course, Kaggle competitions',
      estimatedTime: '3-6 months'
    },
    {
      skill: 'SQL/Data Analysis',
      frequency: 8,
      impact: 'Medium',
      priority: 'Medium',
      learningPath: 'DataCamp SQL track, real project practice',
      estimatedTime: '1-2 months'
    }
  ]);

  // NEW: Performance Analytics for JTBD "Understand what's working"
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalApplications: 12,
    interviewsReceived: 8,
    interviewRate: 67,
    averageMatchScore: 84,
    topPerformingEmphasis: ['Revenue Growth', 'Mobile Experience', 'Team Leadership'],
    improvementAreas: ['Technical Skills', 'Industry-Specific Experience']
  });

  // UI State - removed useDragDrop toggle, defaulting to drag and drop

  // Authentication
  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load skill profile when user changes
  useEffect(() => {
    if (user) {
      loadSkillProfile();
      loadExperiences();
    }
  }, [user]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
    }
  };

  // Application management functions
  const handleCompanySelect = (companyData) => {
    setNewApplication(prev => ({
      ...prev,
      company: companyData.name,
      companyData: companyData
    }));
  };

  const addApplication = () => {
    if (newApplication.company && newApplication.role) {
      const application = {
        id: Date.now(),
        ...newApplication
      };
      setApplications(prev => [application, ...prev]);
      setNewApplication({
        company: '',
        companyData: null,
        role: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Applied',
        resumeVersion: '',
        keyEmphasis: [''],
        matchScore: 0,
        feedback: ''
      });
      setShowAddApplication(false);
    }
  };

  const updateApplicationEmphasis = (index, value) => {
    setNewApplication(prev => ({
      ...prev,
      keyEmphasis: prev.keyEmphasis.map((emp, i) => i === index ? value : emp)
    }));
  };

  const addEmphasis = () => {
    setNewApplication(prev => ({
      ...prev,
      keyEmphasis: [...prev.keyEmphasis, '']
    }));
  };

  const removeEmphasis = (index) => {
    setNewApplication(prev => ({
      ...prev,
      keyEmphasis: prev.keyEmphasis.filter((_, i) => i !== index)
    }));
  };

  // Skill Management Functions
  const addSkill = (category, skill) => {
    setSkillProfile(prev => {
      const newProfile = {
        ...prev,
        [category]: [...prev[category], skill]
      };
      saveSkillProfile(newProfile);
      return newProfile;
    });
  };

  const removeSkill = (category, skill) => {
    setSkillProfile(prev => {
      const newProfile = {
        ...prev,
        [category]: prev[category].filter(s => s !== skill)
      };
      saveSkillProfile(newProfile);
      return newProfile;
    });
  };

  const toggleSkill = (category, skill) => {
    if (skillProfile[category].includes(skill)) {
      removeSkill(category, skill);
    } else {
      addSkill(category, skill);
    }
  };

  // Load skill profile from Supabase
  const loadSkillProfile = async () => {
    if (!user || !supabase) return;
    
    try {
      setSkillProfileLoading(true);
      const { data, error } = await supabase
        .from('skill_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading skill profile:', error);
        return;
      }

      if (data && data.skills) {
        setSkillProfile(data.skills);
      }
    } catch (error) {
      console.error('Error loading skill profile:', error);
    } finally {
      setSkillProfileLoading(false);
    }
  };

  // Save skill profile to Supabase
  const saveSkillProfile = async (newProfile) => {
    if (!user || !supabase) return;
    
    try {
      const { error } = await supabase
        .from('skill_profiles')
        .upsert({
          user_id: user.id,
          skills: newProfile,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving skill profile:', error);
      }
    } catch (error) {
      console.error('Error saving skill profile:', error);
    }
  };

  // Load experiences from Supabase
  const loadExperiences = async () => {
    if (!user || !supabase) return;
    
    try {
      setExperiencesLoading(true);
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading experiences:', error);
        return;
      }

      const experiencesWithAchievements = (data || []).map(experience => ({
        ...experience,
        achievements: experience.accomplishments?.map(acc => acc.description) || []
      }));

      setExperiences(experiencesWithAchievements);
    } catch (error) {
      console.error('Error loading experiences:', error);
    } finally {
      setExperiencesLoading(false);
    }
  };


  // Removed manual experience management functions

  // Navigation tabs
  const tabs = [
    { id: 'generate', label: 'Generate Resume', icon: Zap },
    { id: 'profile', label: 'Enhanced Profile', icon: User },
    { id: 'tracking', label: 'Application Tracking', icon: BarChart3 },
    { id: 'analytics', label: 'Performance Analytics', icon: TrendingUp }
  ];



  // Mock candidate profile based on provided documents
  const candidateProfile = {
    name: "C.J. Britz",
    contact: {
      email: "britzchrisj@gmail.com",
      phone: "805.428.7721",
      location: "Los Angeles, CA",
      linkedin: "www.linkedin.com/in/cjbritz/"
    },
    experience: [
      {
        company: "TruConnect",
        role: "Director of Product Management",
        period: "January 2023 - Present",
        achievements: [
          "Promoted to Director in January 2025, now overseeing mobile app with millions of downloads",
          "Redesigned recurring payments flow and brought app into CA auto renewal law compliance",
          "Led 250% revenue growth ($2.4MM annualized profit) through strategic product repositioning",
          "Grew user base from 900k to 1.7MM users",
          "Reduced churn by 9% through Amazon Prime integration for 100k+ user cohort",
          "Improved customer satisfaction by 15% through AI-driven feedback loops"
        ],
        skills: ["Mobile Product Management", "Compliance", "Revenue Growth", "User Acquisition"]
      },
      {
        company: "Guitar Center",
        role: "Oracle ARCS Implementation Project Manager", 
        period: "Recent Project",
        achievements: [
          "Managing end-to-end Oracle ARCS implementation with June 2025 go-live",
          "Led vendor management transition from Centroid to Peloton Group",
          "Coordinated cross-functional teams across Finance, Infrastructure, and IT"
        ],
        skills: ["Enterprise Software Implementation", "Vendor Management", "Cross-functional Leadership"]
      },
      {
        company: "Scorpion",
        role: "Product Manager",
        period: "December 2018 - January 2023",
        achievements: [
          "Led 0-1 SaaS CRM product development for SMB operators",
          "Negotiated payment processing revenue share contracts with Stripe",
          "Managed $1MM+ ARR digital projects for healthcare clients",
          "Won Gold Award for Best Overall Internet Site (eHealthcare Awards)"
        ],
        skills: ["0-1 Product Development", "SaaS", "Healthcare Compliance", "Revenue Strategy"]
      },
      {
        company: "TransMD",
        role: "Founder & Lead Developer",
        period: "December 2024 - Present",
        achievements: [
          "Built React-based healthcare navigation app for transgender community",
          "Designed end-to-end user experience with focus on accessibility",
          "Implemented scalable component architecture"
        ],
        skills: ["React Development", "Healthcare Tech", "Accessibility", "User Research"]
      }
    ],
    skills: {
      technical: ["React", "HTML/CSS/JS", "SQL", "API Integration", "Mobile Development", "Oracle ARCS"],
      product: ["Product Strategy", "Roadmapping", "A/B Testing", "User Research", "Agile/Scrum"],
      leadership: ["Cross-functional Teams", "Vendor Management", "Stakeholder Alignment", "P&L Ownership"],
      domain: ["SaaS", "eCommerce", "Healthcare", "Telecom", "Compliance", "Mobile Apps"]
    },
    education: {
      degree: "Bachelor of Arts in Political Science",
      school: "Loyola Marymount University",
      year: "2017",
      honors: "Cum Laude",
      gpa: "3.6"
    }
  };

  const analyzeJobDescription = (jd) => {
    const keywords = jd.toLowerCase();
    
    // Extract all skills from experiences
    const allExperienceSkills = [];
    experiences.forEach(experience => {
      if (experience.skills_with_evidence) {
        experience.skills_with_evidence.forEach(skillData => {
          allExperienceSkills.push(skillData.skill);
        });
      }
    });

    // Categorize skills from experiences
    const experienceSkillsByCategory = {
      technical: [],
      product: [],
      leadership: [],
      domain: []
    };

    // Helper function to categorize a skill
    const categorizeSkill = (skillName) => {
      const skillLower = skillName.toLowerCase();
      
      // Technical skills
      if (skillLower.includes('react') || skillLower.includes('javascript') || skillLower.includes('api') || 
          skillLower.includes('mobile') || skillLower.includes('development') || skillLower.includes('sql') ||
          skillLower.includes('oracle') || skillLower.includes('integration')) {
        return 'technical';
      }
      
      // Product skills
      if (skillLower.includes('product') || skillLower.includes('strategy') || skillLower.includes('roadmap') ||
          skillLower.includes('testing') || skillLower.includes('research') || skillLower.includes('agile') ||
          skillLower.includes('analytics') || skillLower.includes('discovery')) {
        return 'product';
      }
      
      // Leadership skills
      if (skillLower.includes('lead') || skillLower.includes('manage') || skillLower.includes('team') ||
          skillLower.includes('stakeholder') || skillLower.includes('vendor') || skillLower.includes('cross') ||
          skillLower.includes('strategic') || skillLower.includes('budget') || skillLower.includes('p&l')) {
        return 'leadership';
      }
      
      // Domain skills
      if (skillLower.includes('healthcare') || skillLower.includes('medical') || skillLower.includes('compliance') ||
          skillLower.includes('saas') || skillLower.includes('ecommerce') || skillLower.includes('mobile') ||
          skillLower.includes('fintech') || skillLower.includes('telecom')) {
        return 'domain';
      }
      
      return 'product'; // Default to product
    };

    // Categorize all experience skills
    allExperienceSkills.forEach(skill => {
      const category = categorizeSkill(skill);
      if (!experienceSkillsByCategory[category].includes(skill)) {
        experienceSkillsByCategory[category].push(skill);
      }
    });

    // Merge with skill profile (prioritize experience skills)
    const candidateSkills = {
      technical: [...new Set([...experienceSkillsByCategory.technical, ...(skillProfile.technical || [])])],
      product: [...new Set([...experienceSkillsByCategory.product, ...(skillProfile.product || [])])],
      leadership: [...new Set([...experienceSkillsByCategory.leadership, ...(skillProfile.leadership || [])])],
      domain: [...new Set([...experienceSkillsByCategory.domain, ...(skillProfile.domain || [])])]
    };

    const analysis = {
      role: keywords.includes('senior') ? 'Senior' : keywords.includes('director') ? 'Director' : 'Product Manager',
      industry: keywords.includes('healthcare') ? 'Healthcare' : 
                keywords.includes('fintech') ? 'FinTech' :
                keywords.includes('e-commerce') ? 'eCommerce' : 
                keywords.includes('saas') ? 'SaaS' : 'Technology',
      keyRequirements: [],
      requiredSkills: {
        technical: [],
        product: [],
        leadership: [],
        domain: []
      },
      candidateSkills: candidateSkills,
      skillGaps: {
        technical: [],
        product: [],
        leadership: [],
        domain: []
      },
      matchScore: 0,
      recommendedFocus: [],
      experienceAlignment: [],
      improvementAreas: [],
      relevantExperiences: []
    };

    // Extract required skills from job description
    const technicalKeywords = {
      'React': ['react', 'frontend', 'javascript', 'js', 'web development'],
      'Mobile Development': ['mobile', 'ios', 'android', 'app development', 'react native'],
      'API Integration': ['api', 'rest', 'graphql', 'integration', 'microservices'],
      'Data Analysis': ['data', 'analytics', 'sql', 'python', 'r', 'machine learning', 'ml', 'ai'],
      'Cloud Platforms': ['aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes'],
      'DevOps': ['devops', 'ci/cd', 'jenkins', 'git', 'deployment'],
      'Database': ['database', 'mysql', 'postgresql', 'mongodb', 'nosql'],
      'Security': ['security', 'authentication', 'authorization', 'oauth', 'jwt']
    };

    const productKeywords = {
      'Product Strategy': ['strategy', 'roadmap', 'vision', 'product vision'],
      'User Research': ['user research', 'ux research', 'user testing', 'usability'],
      'A/B Testing': ['a/b testing', 'experimentation', 'optimization', 'conversion'],
      'Analytics': ['analytics', 'metrics', 'kpis', 'dashboard', 'reporting'],
      'Agile/Scrum': ['agile', 'scrum', 'sprint', 'kanban', 'lean'],
      'Product Discovery': ['discovery', 'ideation', 'validation', 'mvp'],
      'Go-to-Market': ['gtm', 'go to market', 'launch', 'marketing'],
      'Competitive Analysis': ['competitive', 'market research', 'benchmarking']
    };

    const leadershipKeywords = {
      'Team Leadership': ['lead', 'manage', 'team', 'mentor', 'coach'],
      'Stakeholder Management': ['stakeholder', 'executive', 'c-level', 'board'],
      'Cross-functional Collaboration': ['cross-functional', 'collaboration', 'partnership'],
      'Strategic Planning': ['strategic', 'planning', 'vision', 'long-term'],
      'Change Management': ['change management', 'transformation', 'organizational'],
      'Budget Management': ['budget', 'p&l', 'financial', 'roi', 'cost'],
      'Vendor Management': ['vendor', 'partner', 'third-party', 'outsourcing'],
      'Crisis Management': ['crisis', 'risk', 'mitigation', 'problem-solving']
    };

    const domainKeywords = {
      'Healthcare': ['healthcare', 'medical', 'hipaa', 'fda', 'clinical', 'patient'],
      'FinTech': ['fintech', 'financial', 'banking', 'payments', 'compliance', 'regulatory'],
      'eCommerce': ['ecommerce', 'retail', 'shopping', 'marketplace', 'inventory'],
      'SaaS': ['saas', 'software', 'subscription', 'recurring revenue', 'enterprise'],
      'Mobile Apps': ['mobile', 'app store', 'ios', 'android', 'native'],
      'AI/ML': ['ai', 'machine learning', 'ml', 'artificial intelligence', 'nlp'],
      'Cybersecurity': ['security', 'cybersecurity', 'threat', 'vulnerability'],
      'IoT': ['iot', 'internet of things', 'connected devices', 'sensors']
    };

    // Analyze required skills
    Object.entries(technicalKeywords).forEach(([skill, keywords]) => {
      if (keywords.some(keyword => jd.includes(keyword))) {
        analysis.requiredSkills.technical.push(skill);
        if (!candidateSkills.technical.includes(skill)) {
          analysis.skillGaps.technical.push(skill);
        }
      }
    });

    Object.entries(productKeywords).forEach(([skill, keywords]) => {
      if (keywords.some(keyword => jd.includes(keyword))) {
        analysis.requiredSkills.product.push(skill);
        if (!candidateSkills.product.includes(skill)) {
          analysis.skillGaps.product.push(skill);
        }
      }
    });

    Object.entries(leadershipKeywords).forEach(([skill, keywords]) => {
      if (keywords.some(keyword => jd.includes(keyword))) {
        analysis.requiredSkills.leadership.push(skill);
        if (!candidateSkills.leadership.includes(skill)) {
          analysis.skillGaps.leadership.push(skill);
        }
      }
    });

    Object.entries(domainKeywords).forEach(([skill, keywords]) => {
      if (keywords.some(keyword => jd.includes(keyword))) {
        analysis.requiredSkills.domain.push(skill);
        if (!candidateSkills.domain.includes(skill)) {
          analysis.skillGaps.domain.push(skill);
        }
      }
    });

    // Extract key requirements
    if (keywords.includes('mobile')) analysis.keyRequirements.push('Mobile Product Management');
    if (keywords.includes('api')) analysis.keyRequirements.push('API Integration');
    if (keywords.includes('growth')) analysis.keyRequirements.push('Growth/Revenue');
    if (keywords.includes('compliance')) analysis.keyRequirements.push('Regulatory Compliance');
    if (keywords.includes('data')) analysis.keyRequirements.push('Data-Driven Decision Making');
    if (keywords.includes('team')) analysis.keyRequirements.push('Team Leadership');
    if (keywords.includes('stakeholder')) analysis.keyRequirements.push('Stakeholder Management');
    if (keywords.includes('strategy')) analysis.keyRequirements.push('Strategic Planning');

    // Find relevant experiences based on job requirements
    experiences.forEach(experience => {
      let relevanceScore = 0;
      const experienceText = `${experience.company} ${experience.role} ${experience.achievements.join(' ')}`.toLowerCase();
      
      // Check for industry match
      if (analysis.industry === 'Healthcare' && experienceText.includes('healthcare')) relevanceScore += 3;
      if (analysis.industry === 'FinTech' && experienceText.includes('financial')) relevanceScore += 3;
      if (analysis.industry === 'eCommerce' && experienceText.includes('ecommerce')) relevanceScore += 3;
      if (analysis.industry === 'SaaS' && experienceText.includes('saas')) relevanceScore += 3;
      
      // Check for skill matches
      analysis.requiredSkills.technical.forEach(skill => {
        if (experienceText.includes(skill.toLowerCase())) relevanceScore += 2;
      });
      analysis.requiredSkills.product.forEach(skill => {
        if (experienceText.includes(skill.toLowerCase())) relevanceScore += 2;
      });
      analysis.requiredSkills.leadership.forEach(skill => {
        if (experienceText.includes(skill.toLowerCase())) relevanceScore += 2;
      });
      analysis.requiredSkills.domain.forEach(skill => {
        if (experienceText.includes(skill.toLowerCase())) relevanceScore += 2;
      });
      
      // Check for key requirement matches
      analysis.keyRequirements.forEach(req => {
        if (experienceText.includes(req.toLowerCase())) relevanceScore += 1;
      });
      
      if (relevanceScore > 0) {
        analysis.relevantExperiences.push({
          ...experience,
          relevanceScore
        });
      }
    });

    // Sort experiences by relevance
    analysis.relevantExperiences.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Generate experience alignment based on real experiences
    analysis.relevantExperiences.slice(0, 3).forEach(exp => {
      analysis.experienceAlignment.push(`${exp.company} - ${exp.role} (${exp.period})`);
    });

    // Calculate match score
    const totalRequiredSkills = [
      ...analysis.requiredSkills.technical,
      ...analysis.requiredSkills.product,
      ...analysis.requiredSkills.leadership,
      ...analysis.requiredSkills.domain
    ].length;

    const matchedSkills = totalRequiredSkills - [
      ...analysis.skillGaps.technical,
      ...analysis.skillGaps.product,
      ...analysis.skillGaps.leadership,
      ...analysis.skillGaps.domain
    ].length;

    analysis.matchScore = totalRequiredSkills > 0 ? Math.min(95, Math.round((matchedSkills / totalRequiredSkills) * 100)) : 70;

    // Generate recommendations based on real experiences
    if (analysis.relevantExperiences.length > 0) {
      const topExperience = analysis.relevantExperiences[0];
      analysis.recommendedFocus.push(`Lead with ${topExperience.company} experience`);
      
      if (topExperience.achievements && topExperience.achievements.length > 0) {
        analysis.recommendedFocus.push(`Highlight key achievements from ${topExperience.company}`);
      }
    }

    if (analysis.industry === 'Healthcare') {
      analysis.recommendedFocus.push('Emphasize healthcare domain expertise');
    }
    if (keywords.includes('mobile')) {
      analysis.recommendedFocus.push('Focus on mobile product experience');
    }
    if (keywords.includes('revenue') || keywords.includes('growth')) {
      analysis.recommendedFocus.push('Highlight revenue and growth achievements');
    }
    if (keywords.includes('team') || keywords.includes('lead')) {
      analysis.recommendedFocus.push('Emphasize leadership and team management');
    }

    return analysis;
  };

  const generateResume = async () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const analysis = analyzeJobDescription(jobDescription);
    setAnalysisResults(analysis);

    // Generate tailored resume content using real experiences
    const resume = `**C.J. BRITZ**
Director of Product Management
Los Angeles, CA | 805.428.7721 | britzchrisj@gmail.com
LinkedIn: www.linkedin.com/in/cjbritz/

**PROFESSIONAL SUMMARY**
${analysis.industry === 'Healthcare' ? 
  'Healthcare-focused Product Leader with 6+ years driving digital transformation in regulated industries. Led 250% revenue growth and managed products serving 1.7M+ users. Expert in HIPAA compliance, healthcare SaaS, and mobile product development.' :
  'Results-driven Product Leader with 6+ years building scalable products across SaaS, mobile, and eCommerce. Proven track record of 250% revenue growth and user base expansion to 1.7M+. Expert in mobile product strategy, revenue optimization, and cross-functional team leadership.'
}

**PROFESSIONAL EXPERIENCE**

${analysis.relevantExperiences.length > 0 ? 
  analysis.relevantExperiences.map(experience => {
    const achievements = experience.achievements && experience.achievements.length > 0 
      ? experience.achievements.slice(0, 4).map(achievement => `• ${achievement}`).join('\n')
      : `• **${experience.role}** at ${experience.company} during ${experience.period}`;
    
    return `**${experience.company}** | Los Angeles, CA
**${experience.role}** | ${experience.period}
${achievements}`;
  }).join('\n\n') :
  // Fallback to hardcoded experiences if no relevant ones found
  `**TruConnect** | Los Angeles, CA
**Director of Product Management** | January 2025 - Present
• **Leading mobile app** with millions of downloads across iOS/Android platforms
• **Redesigned recurring payments** and achieved CA auto renewal law compliance
• **Managing cross-functional teams** of 15+ engineers, designers, and product managers

**Scorpion** | Los Angeles, CA
**Product Manager** | December 2018 - January 2023
• **Built 0-1 SaaS CRM platform** from conception to launch for SMB market
• **Delivered $1MM+ ARR projects** managing full product lifecycle for enterprise clients
• **Led cross-functional teams** of 8+ developers, designers, and stakeholders`
}

**EDUCATION**
Bachelor of Arts in Political Science | Loyola Marymount University | 2017 | Cum Laude (GPA: 3.6)

**RELEVANT SKILLS**
${Object.entries(analysis.candidateSkills).map(([category, skills]) => {
  if (skills.length > 0) {
    return `${category.charAt(0).toUpperCase() + category.slice(1)}: ${skills.slice(0, 5).join(' \u00A0•\u00A0 ')}`;
  }
  return '';
}).filter(Boolean).join('\n')}

**KEY ACHIEVEMENTS**
${analysis.relevantExperiences.length > 0 && analysis.relevantExperiences[0].achievements ? 
  analysis.relevantExperiences[0].achievements.slice(0, 3).map(achievement => `• ${achievement}`).join('\n') :
  '• Led 250% revenue growth through strategic product repositioning\n• Grew user base from 900k to 1.7MM through enhanced digital experience\n• Reduced churn by 9% via strategic partnership integration'
}`;

    setGeneratedResume(resume);
    setIsGenerating(false);

    // Auto-track this application
    const newApplication = {
      id: Date.now(),
      company: analysis.industry === 'Healthcare' ? 'Healthcare Company' : 'Technology Company',
      role: analysis.role,
      date: new Date().toISOString().split('T')[0],
      status: 'Generated',
      resumeVersion: `${analysis.role}-${analysis.industry}-v1`,
      keyEmphasis: analysis.recommendedFocus.map(focus => focus.replace('Highlight ', '').replace('Emphasize ', '').replace('Lead with ', '')),
      matchScore: analysis.matchScore,
      feedback: `Generated resume with ${analysis.matchScore}% match score focusing on ${analysis.industry} industry`
    };
    setApplications(prev => [newApplication, ...prev]);
  };



  const renderProfileBuilder = () => (
    <EnhancedProfileBuilder user={user} />
  );

  const renderGenerateResume = () => (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Job Description Analysis
          </h2>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            onClick={generateResume}
            disabled={!jobDescription.trim() || isGenerating}
            className="mt-4 w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Generate Tailored Resume</span>
              </>
            )}
          </button>
        </div>

        {/* Analysis Results */}
        {analysisResults && (
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-4">Job Analysis Results</h3>
            
            {/* Match Score */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Match Score:</span>
                <span className="font-bold text-lg text-green-600">{analysisResults.matchScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analysisResults.matchScore}%` }}
                ></div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="font-medium">Target Role:</span>
                <p className="text-gray-700">{analysisResults.role}</p>
              </div>
              <div>
                <span className="font-medium">Industry:</span>
                <p className="text-gray-700">{analysisResults.industry}</p>
              </div>
            </div>

            {/* Skills Analysis */}
            <div className="space-y-4">
              {/* Required Skills */}
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">Required Skills</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(analysisResults.requiredSkills).map(([category, skills]) => (
                    skills.length > 0 && (
                      <div key={category}>
                        <span className="font-medium text-gray-700 capitalize">{category}:</span>
                        <ul className="mt-1 list-disc list-inside text-gray-600">
                          {skills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Skill Gaps */}
              {Object.values(analysisResults.skillGaps).some(gaps => gaps.length > 0) && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2">Skill Gaps</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(analysisResults.skillGaps).map(([category, gaps]) => (
                      gaps.length > 0 && (
                        <div key={category}>
                          <span className="font-medium text-gray-700 capitalize">{category}:</span>
                          <ul className="mt-1 space-y-1">
                            {gaps.map((gap, index) => (
                              <li key={index} className="flex items-center justify-between group">
                                <span className="text-orange-600">{gap}</span>
                                <button
                                  onClick={() => toggleSkill(category, gap)}
                                  className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Mark as acquired"
                                >
                                  ✓ Add
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Current Skills */}
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Your Current Skills</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(skillProfile).map(([category, skills]) => (
                    skills.length > 0 && (
                      <div key={category}>
                        <span className="font-medium text-gray-700 capitalize">{category}:</span>
                        <ul className="mt-1 space-y-1">
                          {skills.map((skill, index) => (
                            <li key={index} className="flex items-center justify-between group">
                              <span className="text-green-600">{skill}</span>
                              <button
                                onClick={() => removeSkill(category, skill)}
                                className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove skill"
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Experience Alignment */}
              {analysisResults.experienceAlignment.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Experience Alignment</h4>
                  <ul className="text-sm list-disc list-inside text-gray-600">
                    {analysisResults.experienceAlignment.map((exp, index) => (
                      <li key={index}>{exp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Relevant Experiences */}
              {analysisResults.relevantExperiences && analysisResults.relevantExperiences.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Most Relevant Experiences</h4>
                  <div className="space-y-3">
                    {analysisResults.relevantExperiences.slice(0, 3).map((exp, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-medium text-gray-800">{exp.company}</h5>
                            <p className="text-sm text-gray-600">{exp.role}</p>
                            <p className="text-xs text-gray-500">{exp.period}</p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Score: {exp.relevanceScore}
                          </span>
                        </div>
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Key achievements:</span>
                            <ul className="mt-1 list-disc list-inside">
                              {exp.achievements.slice(0, 2).map((achievement, idx) => (
                                <li key={idx} className="truncate">{achievement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysisResults.recommendedFocus.length > 0 && (
                <div>
                  <h4 className="font-semibold text-purple-700 mb-2">Resume Focus Areas</h4>
                  <ul className="text-sm list-disc list-inside text-gray-600">
                    {analysisResults.recommendedFocus.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvement Areas */}
              {analysisResults.improvementAreas.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Development Opportunities</h4>
                  <ul className="text-sm list-disc list-inside text-gray-600">
                    {analysisResults.improvementAreas.map((area, index) => (
                      <li key={index}>{area}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Output Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-green-600" />
            Generated Resume
          </h2>
          <ResumeOutput 
            resume={generatedResume} 
            analysisResults={analysisResults}
          />
        </div>
      </div>
    </div>
  );

  // NEW: Application Tracking for JTBD "Maintain consistency across applications"
  const renderApplicationTracking = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Tracking</h2>
        <p className="text-gray-600">Track your applications and maintain consistency across interviews</p>
      </div>

      {/* Application Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
          <div className="text-sm text-gray-600">Total Applications</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {applications.filter(app => app.status.includes('Interview')).length}
          </div>
          <div className="text-sm text-gray-600">Interviews</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(applications.reduce((acc, app) => acc + app.matchScore, 0) / applications.length)}%
          </div>
          <div className="text-sm text-gray-600">Avg Match Score</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {applications.filter(app => app.status === 'Applied').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Recent Applications</h3>
          <button 
            onClick={() => setShowAddApplication(!showAddApplication)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddApplication ? 'Cancel' : 'Add Application'}</span>
          </button>
        </div>

        {/* Add Application Form */}
        {showAddApplication && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Add New Application</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <CompanySearch 
                  onCompanySelect={handleCompanySelect}
                  selectedCompany={newApplication.companyData}
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <input
                  type="text"
                  value={newApplication.role}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g., Senior Product Manager"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Application Date</label>
                <input
                  type="date"
                  value={newApplication.date}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={newApplication.status}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Interview Completed">Interview Completed</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>

              {/* Resume Version */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resume Version</label>
                <input
                  type="text"
                  value={newApplication.resumeVersion}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, resumeVersion: e.target.value }))}
                  placeholder="e.g., Netflix-Senior-PM-v1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Match Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Match Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newApplication.matchScore}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, matchScore: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Key Emphasis */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Key Emphasis Areas</label>
              <div className="space-y-2">
                {newApplication.keyEmphasis.map((emphasis, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={emphasis}
                      onChange={(e) => updateApplicationEmphasis(index, e.target.value)}
                      placeholder="e.g., Mobile Product Strategy"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => removeEmphasis(index)}
                      className="px-2 py-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={addEmphasis}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add emphasis area
                </button>
              </div>
            </div>

            {/* Feedback */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Feedback/Notes</label>
              <textarea
                value={newApplication.feedback}
                onChange={(e) => setNewApplication(prev => ({ ...prev, feedback: e.target.value }))}
                placeholder="Any feedback from interviews or application process..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={addApplication}
                disabled={!newApplication.company || !newApplication.role}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Application
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {app.companyData?.logo && (
                    <img
                      src={app.companyData.logo}
                      alt={`${app.company} logo`}
                      className="w-8 h-8 rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-800">{app.role} at {app.company}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Applied: {app.date}</span>
                      {app.companyData?.industry && (
                        <span>• {app.companyData.industry}</span>
                      )}
                      {app.companyData?.location && (
                        <span>• {app.companyData.location}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    app.status.includes('Interview') ? 'bg-green-100 text-green-800' :
                    app.status === 'Applied' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'Offer' ? 'bg-blue-100 text-blue-800' :
                    app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {app.status}
                  </span>
                  <span className="text-sm font-medium text-gray-600">{app.matchScore}% Match</span>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">Resume Version: <span className="font-medium">{app.resumeVersion}</span></p>
                <div className="flex flex-wrap gap-2">
                  {app.keyEmphasis.map((emphasis, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {emphasis}
                    </span>
                  ))}
                </div>
              </div>

              {app.feedback && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700"><strong>Feedback:</strong> {app.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // NEW: Performance Analytics for JTBD "Understand what's working"
  const renderPerformanceAnalytics = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Performance Analytics</h2>
        <p className="text-gray-600">Understand what's working and identify improvement opportunities</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Success</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Interview Rate</span>
              <span className="font-semibold text-green-600">{performanceMetrics.interviewRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Match Score</span>
              <span className="font-semibold text-blue-600">{performanceMetrics.averageMatchScore}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Applications</span>
              <span className="font-semibold text-gray-800">{performanceMetrics.totalApplications}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Elements</h3>
          <div className="space-y-3">
            {performanceMetrics.topPerformingEmphasis.map((emphasis, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">{emphasis}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skill Gap Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Skill Development Priorities</h3>
        <div className="space-y-4">
          {skillGaps.map((gap, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">{gap.skill}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    gap.priority === 'High' ? 'bg-red-100 text-red-800' :
                    gap.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {gap.priority} Priority
                  </span>
                  <span className="text-sm text-gray-600">{gap.frequency} job postings</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Impact: <span className="font-medium">{gap.impact}</span></p>
              <p className="text-sm text-gray-600 mb-2">Learning Path: {gap.learningPath}</p>
              <p className="text-sm text-gray-600">Estimated Time: <span className="font-medium">{gap.estimatedTime}</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Improvement Recommendations</h3>
        <div className="space-y-3">
          {performanceMetrics.improvementAreas.map((area, index) => (
            <div key={index} className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-700">Focus on {area}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!user) {
    return <Auth onAuthStateChange={setUser} />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-800">AI Resume Tailoring Tool</h1>
            <div className="flex items-center space-x-2 text-green-600">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">Powered by Career AI</span>
            </div>
          </div>
          
          {/* User info and sign out */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-blue-600" />
              </div>
              <span>{user.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'generate' && renderGenerateResume()}
        {activeTab === 'profile' && renderProfileBuilder()}
        {activeTab === 'tracking' && renderApplicationTracking()}
        {activeTab === 'analytics' && renderPerformanceAnalytics()}
      </div>

      {/* Feature Overview - Only show on generate tab */}
      {activeTab === 'generate' && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Input Job Description</h3>
              <p className="text-sm text-gray-600">Paste any job posting and our AI analyzes key requirements, skills, and company culture</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">AI Matching</h3>
              <p className="text-sm text-gray-600">Intelligent algorithm matches your experience with job requirements and optimizes content</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Tailored Resume</h3>
              <p className="text-sm text-gray-600">Get a perfectly crafted resume highlighting your most relevant achievements</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;