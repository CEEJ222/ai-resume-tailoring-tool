import React, { useState } from 'react';
import { Upload, FileText, Download, Zap, Target, Award, Users, Settings, Database, BookOpen, User, Briefcase, FileImage, Trash2, Edit, Plus } from 'lucide-react';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [jobDescription, setJobDescription] = useState('');
  const [generatedResume, setGeneratedResume] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  
  // Data Management State
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 1, name: 'C.Britz Resume - Disney, CRM.pdf', type: 'resume', uploadDate: '2024-01-15', size: '124 KB' },
    { id: 2, name: 'TruConnect Product Strategy.docx', type: 'writing', uploadDate: '2024-01-10', size: '89 KB' },
    { id: 3, name: 'PM Skills Matrix.xlsx', type: 'resource', uploadDate: '2024-01-08', size: '45 KB' }
  ]);
  
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [newExperience, setNewExperience] = useState({
    company: '',
    role: '',
    startDate: '',
    endDate: '',
    achievements: [''],
    skills: []
  });

  const handleFileUpload = (event, fileType) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: fileType,
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${Math.round(file.size / 1024)} KB`,
      file: file
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const addExperience = () => {
    if (newExperience.company && newExperience.role) {
      setExperiences(prev => [...prev, { ...newExperience, id: Date.now() }]);
      setNewExperience({
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        achievements: [''],
        skills: []
      });
      setShowAddExperience(false);
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
      achievements: prev.achievements.map((ach, i) => i === index ? value : ach)
    }));
  };

  const removeAchievement = (index) => {
    setNewExperience(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  // Navigation tabs
  const tabs = [
    { id: 'generate', label: 'Generate Resume', icon: Zap },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'profile', label: 'Profile Builder', icon: User }
  ];

  // File type configurations
  const fileTypes = [
    { 
      type: 'resume', 
      label: 'Resume Versions', 
      icon: FileText, 
      accept: '.pdf,.doc,.docx',
      description: 'Upload different versions of your resume for analysis and content extraction'
    },
    { 
      type: 'writing', 
      label: 'Writing Samples', 
      icon: BookOpen, 
      accept: '.pdf,.doc,.docx,.txt',
      description: 'Product requirements, strategy docs, case studies, and other writing samples'
    },
    { 
      type: 'resource', 
      label: 'Resources', 
      icon: Briefcase, 
      accept: '.pdf,.doc,.docx,.xlsx,.ppt,.pptx',
      description: 'Skills matrices, templates, certifications, and reference materials'
    }
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

    // Generate tailored resume content
    const resume = `**C.J. Britz**
Director of Product Management
Los Angeles, CA | 805.428.7721 | britzchrisj@gmail.com

**Summary**
${analysis.industry === 'Healthcare' ? 
  'Healthcare-focused Product Leader with 6+ years driving digital transformation in regulated industries. Led 250% revenue growth and managed products serving 1.7M+ users.' :
  'Results-driven Product Leader with 6+ years building scalable products across SaaS, mobile, and eCommerce. Proven track record of 250% revenue growth and user base expansion to 1.7M+.'
}

**Professional Experience**

**TruConnect** | Los Angeles, CA
**Director of Product Management** | January 2025 - Present
${analysis.keyRequirements.includes('Mobile Product Management') ? 
  '• **Leading mobile app** with millions of downloads across iOS/Android platforms\n• **Redesigned recurring payments** and achieved CA auto renewal law compliance\n• **Rebuilt app architecture** using React for improved scalability and performance' :
  '• **Promoted to Director** overseeing product strategy for telecom platform\n• **Led compliance initiatives** ensuring regulatory adherence across all products'
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
• **Won Gold Award** for Best Overall Internet Site (eHealthcare Awards 2020)` :
`**Scorpion** | Los Angeles, CA  
**Product Manager** | December 2018 - January 2023
• **Built 0-1 SaaS CRM platform** from conception to launch for SMB market
• **Negotiated revenue share contracts** with payment processors including Stripe partnership
• **Delivered $1MM+ ARR projects** managing full product lifecycle for enterprise clients`
}

${analysis.industry === 'Healthcare' ? 
`**TransMD** | Personal Project
**Founder & Lead Developer** | December 2024 - Present
• **Designed and built React-based healthcare navigation app** for underserved communities
• **Implemented accessibility-first design** ensuring WCAG compliance and inclusive user experience
• **Conducted user research** to validate product-market fit and iterate on core features` : ''
}

**Education**
Bachelor of Arts in Political Science | Loyola Marymount University | 2017 | Cum Laude

**Key Skills**
${analysis.keyRequirements.includes('Mobile Product Management') ? '• Mobile Product Strategy & Development' : ''}
${analysis.keyRequirements.includes('API Integration') ? '• API Integration & Platform Architecture' : ''}
${analysis.keyRequirements.includes('Growth/Revenue') ? '• Revenue Growth & Monetization Strategy' : ''}
${analysis.keyRequirements.includes('Regulatory Compliance') ? '• Regulatory Compliance (HIPAA, PCI, CA Auto Renewal)' : ''}
• Product Roadmapping & Strategy • Cross-functional Team Leadership • Data-Driven Decision Making`;

    setGeneratedResume(resume);
    setIsGenerating(false);
  };

  const renderDataManagement = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Management Center</h2>
        <p className="text-gray-600">Upload and organize your career documents to power AI resume generation</p>
      </div>

      {fileTypes.map(fileType => (
        <div key={fileType.type} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <fileType.icon className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{fileType.label}</h3>
                <p className="text-sm text-gray-600">{fileType.description}</p>
              </div>
            </div>
            <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
              <input
                type="file"
                multiple
                accept={fileType.accept}
                onChange={(e) => handleFileUpload(e, fileType.type)}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-2">
            {uploadedFiles
              .filter(file => file.type === fileType.type)
              .map(file => (
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
            {uploadedFiles.filter(file => file.type === fileType.type).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <fileType.icon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No {fileType.label.toLowerCase()} uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-800 mb-3">AI Training Status</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{uploadedFiles.filter(f => f.type === 'resume').length}</div>
            <div className="text-sm text-gray-600">Resumes Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{uploadedFiles.filter(f => f.type === 'writing').length}</div>
            <div className="text-sm text-gray-600">Writing Samples</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{uploadedFiles.filter(f => f.type === 'resource').length}</div>
            <div className="text-sm text-gray-600">Resources Loaded</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfileBuilder = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Builder</h2>
        <p className="text-gray-600">Build and refine your master profile for AI-powered resume generation</p>
      </div>

      {/* Experience Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Professional Experience</h3>
          <button 
            onClick={() => setShowAddExperience(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Experience</span>
          </button>
        </div>

        {showAddExperience && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-semibold mb-4">Add New Experience</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Company"
                value={newExperience.company}
                onChange={(e) => setNewExperience(prev => ({...prev, company: e.target.value}))}
                className="p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Role/Title"
                value={newExperience.role}
                onChange={(e) => setNewExperience(prev => ({...prev, role: e.target.value}))}
                className="p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="date"
                placeholder="Start Date"
                value={newExperience.startDate}
                onChange={(e) => setNewExperience(prev => ({...prev, startDate: e.target.value}))}
                className="p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="date"
                placeholder="End Date"
                value={newExperience.endDate}
                onChange={(e) => setNewExperience(prev => ({...prev, endDate: e.target.value}))}
                className="p-3 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Key Achievements</label>
              {newExperience.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="• Achievement with quantifiable impact..."
                    value={achievement}
                    onChange={(e) => updateAchievement(index, e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg"
                  />
                  {newExperience.achievements.length > 1 && (
                    <button 
                      onClick={() => removeAchievement(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button 
                onClick={addAchievement}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Achievement</span>
              </button>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={addExperience}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Save Experience
              </button>
              <button 
                onClick={() => setShowAddExperience(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {candidateProfile.experience.map((exp, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-lg">{exp.role}</h4>
                <button className="text-gray-400 hover:text-blue-600">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-600 mb-3">{exp.company} | {exp.period}</p>
              <div className="space-y-1">
                {exp.achievements.slice(0, 3).map((achievement, i) => (
                  <p key={i} className="text-sm text-gray-700">• {achievement}</p>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {exp.skills.map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills & Competencies</h3>
        <div className="grid grid-cols-2 gap-6">
          {Object.entries(candidateProfile.skills).map(([category, skillList]) => (
            <div key={category}>
              <h4 className="font-medium text-gray-700 mb-3 capitalize">{category} Skills</h4>
              <div className="flex flex-wrap gap-2">
                {skillList.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
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
          <div className="h-96 overflow-y-auto bg-gray-50 border border-gray-300 rounded-lg p-4">
            {generatedResume ? (
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                {generatedResume}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your tailored resume will appear here</p>
                </div>
              </div>
            )}
          </div>
          {generatedResume && (
            <button className="mt-4 w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download Resume</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">AI Resume Tailoring Tool</h1>
          <div className="flex items-center space-x-2 text-green-600">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium">Powered by Career AI</span>
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
        {activeTab === 'data' && renderDataManagement()}
        {activeTab === 'profile' && renderProfileBuilder()}
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