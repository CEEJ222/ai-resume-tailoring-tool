# AI Resume Tailoring Tool

An intelligent web application that automatically tailors resumes to match job descriptions using AI-powered analysis and content optimization. Features an enhanced profile builder with automatic skill extraction and experience merging.

## 🚀 New Features

### Enhanced Profile Builder
- **Single File Upload**: Upload any career document (resumes, cover letters, writing samples)
- **Auto-Detection**: System automatically detects file types based on content and filename
- **Smart Skill Extraction**: Automatically identifies skills from document content
- **Experience Merging**: Intelligently merges overlapping job experiences from multiple documents
- **Evidence-Based Skills**: Add skills with specific evidence and impact metrics
- **Easy Management**: Remove skills and experiences with simple UI controls

### Key Capabilities
- **Document Analysis**: Extracts skills, experiences, and achievements from uploaded files
- **Smart Merging**: Combines duplicate experiences and removes redundant information
- **Skill Gap Analysis**: Identifies missing skills for job applications
- **Evidence Tracking**: Maintains proof of skills with specific examples
- **Profile Growth**: Builds comprehensive career profile from multiple documents

## 🚀 Features

### **Resume Generation**
- **Smart Job Analysis**: Automatically extracts key requirements, skills, and industry focus from job descriptions
- **Intelligent Matching**: Calculates compatibility scores and identifies relevant experience
- **Dynamic Content**: Generates tailored resumes highlighting the most relevant achievements
- **Industry Optimization**: Adapts content based on target industry (Healthcare, SaaS, FinTech, etc.)

### **Data Management**
- **Resume Library**: Upload and organize multiple resume versions for content extraction
- **Writing Samples**: Store PRDs, strategy docs, case studies, and professional writing
- **Resource Hub**: Manage skills matrices, certifications, and reference materials
- **AI Training**: Track uploaded content that powers resume generation

### **Profile Builder**
- **Experience Management**: Add, edit, and organize professional experiences
- **Achievement Tracking**: Input quantifiable accomplishments with impact metrics
- **Skills Organization**: Categorize technical, product, leadership, and domain expertise
- **Dynamic Updates**: Build master profile that feeds AI-powered content generation

## 🛠 Technologies

- **Frontend**: React 18, Lucide React Icons
- **Styling**: Tailwind CSS with responsive design
- **State Management**: React Hooks (useState, useEffect)
- **Backend**: Supabase (PostgreSQL, Storage, Auth)
- **File Handling**: JavaScript FileReader API
- **Deployment**: Vercel ready

## 🏗️ Technical Implementation

### Database Schema
- **Enhanced Files Table**: Stores document metadata, extracted content, and identified skills
- **Experiences Table**: Manages job experiences with achievements and skill evidence
- **Skill Profiles Table**: Tracks user skills across categories

### AI-Powered Features
- **Content Extraction**: Parses document text to identify skills and experiences
- **Smart Classification**: Auto-detects document types (resume, cover letter, etc.)
- **Experience Parsing**: Extracts company, role, period, and achievements
- **Skill Mapping**: Maps extracted content to standardized skill categories

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-resume-tailoring-tool.git
   cd ai-resume-tailoring-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🚀 Deployment

### GitHub Pages Deployment

1. **Update package.json homepage**
   ```json
   "homepage": "https://yourusername.github.io/ai-resume-tailoring-tool"
   ```

2. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Deploy to GitHub Pages**
   ```bash
   npm run deploy
   ```

### Alternative Deployment Options

- **Netlify**: Connect your GitHub repo for automatic deployments
- **Vercel**: Import project and deploy with zero configuration
- **Heroku**: Add buildpack for create-react-app deployment

## 📁 Project Structure

```
ai-resume-tailoring-tool/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/          # Future component organization
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Helper functions
│   ├── App.js              # Main application component
│   ├── App.css             # Application styles
│   └── index.js            # React entry point
├── package.json
└── README.md
```

## 🎯 Usage

### **1. Generate Resume**
1. Navigate to the "Generate Resume" tab
2. Paste a job description in the text area
3. Click "Generate Tailored Resume"
4. Review the analysis results and generated resume
5. Download or copy the tailored content

### **2. Manage Data**
1. Go to "Data Management" tab
2. Upload resumes, writing samples, and resources
3. Organize files by category
4. Track AI training status

### **3. Build Profile**
1. Access "Profile Builder" tab
2. Add professional experiences with achievements
3. Organize skills by category
4. Edit existing experiences as needed

## 🔧 Customization

### **Adding New Industries**
Update the `analyzeJobDescription` function in `App.js`:

```javascript
industry: keywords.includes('healthcare') ? 'Healthcare' : 
          keywords.includes('fintech') ? 'FinTech' :
          keywords.includes('gaming') ? 'Gaming' :     // Add new industry
          keywords.includes('saas') ? 'SaaS' : 'Technology'
```

### **Modifying Candidate Profile**
Edit the `candidateProfile` object in `App.js` to match your experience:

```javascript
const candidateProfile = {
  name: "Your Name",
  contact: {
    email: "your.email@example.com",
    // ... update contact info
  },
  experience: [
    // ... add your experiences
  ]
};
```

### **Styling Changes**
Modify `App.css` to customize:
- Color schemes
- Typography
- Layout spacing
- Component styles

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Future Enhancements

- [ ] **Real AI Integration**: Connect to OpenAI or Claude API for actual AI processing
- [ ] **PDF Export**: Generate downloadable PDF resumes
- [ ] **Template System**: Multiple resume templates and formats
- [ ] **Analytics Dashboard**: Track application success rates
- [ ] **Cover Letter Generation**: AI-powered cover letter creation
- [ ] **LinkedIn Integration**: Import profile data automatically
- [ ] **Job Board API**: Direct integration with job posting sites
- [ ] **Collaboration Features**: Share and review resumes with others

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React and Lucide React icons
- Inspired by the need for personalized job applications
- Designed for product managers and tech professionals

## 📞 Support

For support, email britzchrisj@gmail.com or create an issue in the GitHub repository.

---

**Made with ❤️ for job seekers who want to stand out**