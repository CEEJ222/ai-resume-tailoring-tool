import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, Zap, Target, Award, Users, Settings, Database, BookOpen, User, Briefcase, FileImage, Trash2, Edit, Plus, TrendingUp, CheckCircle, AlertCircle, BarChart3, AlertTriangle, LogOut } from 'lucide-react';
import './App.css';
import useSupabaseFileUpload from './hooks/useSupabaseFileUpload';
import { supabase } from './lib/supabase';
import DragDropUpload from './components/DragDropUpload';
import Auth from './components/Auth';
import CompanySearch from './components/CompanySearch';
import ResumeOutput from './components/ResumeOutput';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('generate');
  const [jobDescription, setJobDescription] = useState('');
  const [generatedResume, setGeneratedResume] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  
  // Use custom file upload hook
  const {
    uploadedFiles,
    isUploading,
    uploadError,
    isLoading,
    fileTypes,
    handleFileUpload,
    removeFile,
    getFilesByType,
    getUploadStats,
    clearError,
    addFileManually,
    loadFiles
  } = useSupabaseFileUpload();
  
  const [skills, setSkills] = useState([]);

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



  // Removed manual experience management functions

  // Navigation tabs
  const tabs = [
    { id: 'generate', label: 'Generate Resume', icon: Zap },
    { id: 'profile', label: 'Profile Builder', icon: User },
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
    // Simulate AI analysis
    const keywords = jd.toLowerCase();
    const analysis = {
      role: keywords.includes('senior') ? 'Senior' : keywords.includes('director') ? 'Director' : 'Product Manager',
      industry: keywords.includes('healthcare') ? 'Healthcare' : 
                keywords.includes('fintech') ? 'FinTech' :
                keywords.includes('e-commerce') ? 'eCommerce' : 
                keywords.includes('saas') ? 'SaaS' : 'Technology',
      keyRequirements: [],
      matchScore: 0,
      recommendedFocus: []
    };

    // Extract requirements
    if (keywords.includes('mobile')) analysis.keyRequirements.push('Mobile Product Management');
    if (keywords.includes('api')) analysis.keyRequirements.push('API Integration');
    if (keywords.includes('growth')) analysis.keyRequirements.push('Growth/Revenue');
    if (keywords.includes('compliance')) analysis.keyRequirements.push('Regulatory Compliance');
    if (keywords.includes('data')) analysis.keyRequirements.push('Data-Driven Decision Making');

    // Calculate match score
    analysis.matchScore = Math.min(95, 70 + (analysis.keyRequirements.length * 5));

    // Recommendations
    if (analysis.industry === 'Healthcare') {
      analysis.recommendedFocus.push('Highlight Scorpion healthcare projects and TransMD');
    }
    if (keywords.includes('mobile')) {
      analysis.recommendedFocus.push('Emphasize TruConnect mobile app leadership');
    }
    if (keywords.includes('revenue') || keywords.includes('growth')) {
      analysis.recommendedFocus.push('Lead with 250% revenue growth achievement');
    }

    return analysis;
  };

  const generateResume = async () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const analysis = analyzeJobDescription(jobDescription);
    setAnalysisResults(analysis);

    // Generate tailored resume content with improved formatting
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

**TruConnect** | Los Angeles, CA
**Director of Product Management** | January 2025 - Present
${analysis.keyRequirements.includes('Mobile Product Management') ? 
  '• **Leading mobile app** with millions of downloads across iOS/Android platforms\n• **Redesigned recurring payments** and achieved CA auto renewal law compliance\n• **Rebuilt app architecture** using React for improved scalability and performance\n• **Managing cross-functional teams** of 15+ engineers, designers, and product managers' :
  '• **Promoted to Director** overseeing product strategy for telecom platform\n• **Led compliance initiatives** ensuring regulatory adherence across all products\n• **Managing P&L** for $2.4MM annualized profit portfolio\n• **Overseeing product roadmap** for 1.7M+ user platform'
}

**Senior Product Manager** | January 2023 - January 2025
• **Delivered 250% revenue growth** ($2.4MM annualized profit) through strategic product repositioning
• **Grew user base from 900k to 1.7MM** through enhanced digital experience and feature optimization
• **Reduced churn by 9%** via strategic partnership integration (Amazon Prime) for 100k+ user cohort
• **Improved customer satisfaction by 15%** through AI-driven feedback loops and rapid iteration

${analysis.industry === 'Healthcare' || analysis.keyRequirements.includes('Regulatory Compliance') ?
`**Scorpion** | Los Angeles, CA
**Product Manager** | December 2018 - January 2023
• **Led 0-1 SaaS CRM development** for healthcare and regulated industry clients
• **Managed $1MM+ ARR projects** for multi-state health systems and telehealth startups
• **Implemented HIPAA compliance** across all digital touchpoints and patient data workflows
• **Won Gold Award** for Best Overall Internet Site (eHealthcare Awards 2020)
• **Negotiated payment processing contracts** with Stripe and other providers` :
`**Scorpion** | Los Angeles, CA  
**Product Manager** | December 2018 - January 2023
• **Built 0-1 SaaS CRM platform** from conception to launch for SMB market
• **Negotiated revenue share contracts** with payment processors including Stripe partnership
• **Delivered $1MM+ ARR projects** managing full product lifecycle for enterprise clients
• **Won Gold Award** for Best Overall Internet Site (eHealthcare Awards 2020)
• **Led cross-functional teams** of 8+ developers, designers, and stakeholders`
}

${analysis.industry === 'Healthcare' ? 
`**TransMD** | Personal Project
**Founder & Lead Developer** | December 2024 - Present
• **Designed and built React-based healthcare navigation app** for underserved communities
• **Implemented accessibility-first design** ensuring WCAG compliance and inclusive user experience
• **Conducted user research** to validate product-market fit and iterate on core features
• **Managed full-stack development** including React frontend and API integration` : ''
}

**EDUCATION**
Bachelor of Arts in Political Science | Loyola Marymount University | 2017 | Cum Laude (GPA: 3.6)

**TECHNICAL SKILLS**
${analysis.keyRequirements.includes('Mobile Product Management') ? '• Mobile Product Strategy & Development (iOS/Android)' : ''}
${analysis.keyRequirements.includes('API Integration') ? '• API Integration & Platform Architecture' : ''}
${analysis.keyRequirements.includes('Growth/Revenue') ? '• Revenue Growth & Monetization Strategy' : ''}
${analysis.keyRequirements.includes('Regulatory Compliance') ? '• Regulatory Compliance (HIPAA, PCI, CA Auto Renewal)' : ''}
• Product Roadmapping & Strategy • Cross-functional Team Leadership • Data-Driven Decision Making
• React Development • SQL & Data Analysis • Agile/Scrum Methodologies • A/B Testing & Optimization`;

    setGeneratedResume(resume);
    setIsGenerating(false);

    // NEW: Auto-track this application for JTBD "Maintain consistency across applications"
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
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Builder</h2>
        <p className="text-gray-600">Upload your documents and build your professional profile for AI-powered resume generation</p>
      </div>

      {/* Error Display */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Upload Error</span>
          </div>
          <p className="text-red-700 mt-1">{uploadError}</p>
          <button 
            onClick={clearError}
            className="text-red-600 hover:text-red-800 text-sm mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Loading your files...</span>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Uploading files...</span>
          </div>
        </div>
      )}

      {/* Document Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Upload Documents</h3>
        
        {fileTypes.map(fileType => {
          const Icon = fileType.type === 'resume' ? FileText : 
                      fileType.type === 'writing' ? BookOpen : Briefcase;
          
          return (
            <div key={fileType.type} className="mb-8 last:mb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Icon className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-800">{fileType.label}</h4>
                    <p className="text-sm text-gray-600">{fileType.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Max size: {fileType.maxSize / (1024 * 1024)}MB • Accepted: {fileType.accept}
                    </p>
                  </div>
                </div>
              </div>

              {/* Drag & Drop Upload Area - Always show when no files OR show compact version when files exist */}
              {getFilesByType(fileType.type).length === 0 ? (
                <div className="mb-4">
                  <DragDropUpload
                    fileType={fileType.type}
                    onUpload={handleFileUpload}
                    isUploading={isUploading}
                    accept={fileType.accept}
                    maxSize={fileType.maxSize}
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <DragDropUpload
                    fileType={fileType.type}
                    onUpload={handleFileUpload}
                    isUploading={isUploading}
                    accept={fileType.accept}
                    maxSize={fileType.maxSize}
                    compact={true}
                  />
                </div>
              )}

              {/* Uploaded Files List */}
              <div className="space-y-2">
                {getFilesByType(fileType.type).map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileImage className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800">{file.name}</p>
                        <p className="text-sm text-gray-600">Uploaded {file.uploadDate} • {file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          );
        })}
      </div>






    </div>
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
            <h3 className="font-semibold text-blue-800 mb-3">Analysis Results</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Match Score:</span>
                <span className="font-bold text-green-600">{analysisResults.matchScore}%</span>
              </div>
              <div className="flex justify-between">
                <span>Target Role:</span>
                <span className="font-medium">{analysisResults.role}</span>
              </div>
              <div className="flex justify-between">
                <span>Industry:</span>
                <span className="font-medium">{analysisResults.industry}</span>
              </div>
              <div className="mt-3">
                <span className="font-medium">Key Requirements:</span>
                <ul className="mt-1 list-disc list-inside text-gray-600">
                  {analysisResults.keyRequirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
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