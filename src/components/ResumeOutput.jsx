import React, { useRef } from 'react';
import { Download, FileText, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

const ResumeOutput = ({ resume, analysisResults, onDownload }) => {
  const resumeRef = useRef(null);

  const downloadAsPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20; // 20mm margins
      const contentWidth = pageWidth - (2 * margin);
      let yPosition = margin;

      // Set font styles
      pdf.setFont('helvetica');
      
      // Parse and render resume content
      const lines = resume.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) {
          yPosition += 3; // Small spacing for empty lines
          continue;
        }

        // Check if we need a new page
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        // Handle headers (lines starting with **)
        if (line.startsWith('**') && line.endsWith('**')) {
          const headerText = line.replace(/\*\*/g, '');
          if (headerText.includes('|')) {
            // Company and location header
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text(headerText, margin, yPosition);
            yPosition += 8;
          } else {
            // Section headers - add extra space before them
            yPosition += 4; // Extra space before section headers
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text(headerText.toUpperCase(), margin, yPosition);
            yPosition += 8;
            // Remove the underline line
          }
          continue;
        }

        // Handle role and period (lines starting with ** but not ending with **)
        if (line.startsWith('**') && !line.endsWith('**')) {
          const roleText = line.replace(/\*\*/g, '');
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text(roleText, margin, yPosition);
          yPosition += 7;
          continue;
        }

        // Handle bullet points
        if (line.startsWith('•')) {
          const bulletText = line.substring(1).trim();
          const textRuns = parseBoldTextForPDF(bulletText);
          
          // Start bullet point
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text('•', margin, yPosition);
          
          let xOffset = margin + 5;
          let currentY = yPosition;
          
          textRuns.forEach((run, index) => {
            pdf.setFontSize(9);
            pdf.setFont('helvetica', run.bold ? 'bold' : 'normal');
            
            // Split text into words for proper wrapping
            const words = run.text.split(' ');
            let currentLine = '';
            
            for (let i = 0; i < words.length; i++) {
              const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
              const testWidth = pdf.getTextWidth(testLine);
              
              if (testWidth > contentWidth - 5) { // Account for bullet indent
                // Current line is full, write it and start new line
                if (currentLine) {
                  pdf.text(currentLine, xOffset, currentY);
                  currentY += 4;
                  xOffset = margin + 5; // Maintain bullet indent
                  
                  // Check if we need a new page
                  if (currentY > pageHeight - margin) {
                    pdf.addPage();
                    currentY = margin;
                  }
                }
                currentLine = words[i];
              } else {
                currentLine = testLine;
              }
            }
            
            // Write the last line
            if (currentLine) {
              pdf.text(currentLine, xOffset, currentY);
              xOffset += pdf.getTextWidth(currentLine);
            }
          });
          
          yPosition = currentY + 5;
          continue;
        }

        // Handle regular text
        if (line) {
          const textRuns = parseBoldTextForPDF(line);
          
          let xOffset = margin;
          let currentY = yPosition;
          
          textRuns.forEach((run) => {
            pdf.setFontSize(9);
            pdf.setFont('helvetica', run.bold ? 'bold' : 'normal');
            
            // Split text into words for proper wrapping
            const words = run.text.split(' ');
            let currentLine = '';
            
            for (let i = 0; i < words.length; i++) {
              const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
              const testWidth = pdf.getTextWidth(testLine);
              
              if (testWidth > contentWidth) {
                // Current line is full, write it and start new line
                if (currentLine) {
                  pdf.text(currentLine, xOffset, currentY);
                  currentY += 4;
                  xOffset = margin;
                  
                  // Check if we need a new page
                  if (currentY > pageHeight - margin) {
                    pdf.addPage();
                    currentY = margin;
                  }
                }
                currentLine = words[i];
              } else {
                currentLine = testLine;
              }
            }
            
            // Write the last line
            if (currentLine) {
              pdf.text(currentLine, xOffset, currentY);
              xOffset += pdf.getTextWidth(currentLine);
            }
          });
          
          // Add extra spacing after LinkedIn line
          if (line.includes('LinkedIn:')) {
            yPosition = currentY + 8; // Extra space after LinkedIn
          } else {
            yPosition = currentY + 4;
          }
        }
      }

      pdf.save(`CJ_Britz_Resume_${analysisResults?.role || 'Product_Manager'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const parseBoldTextForPDF = (text) => {
    const textRuns = [];
    let currentIndex = 0;
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold section
      if (match.index > currentIndex) {
        textRuns.push({
          text: text.slice(currentIndex, match.index),
          bold: false
        });
      }

      // Add the bold text
      textRuns.push({
        text: match[1],
        bold: true
      });

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      textRuns.push({
        text: text.slice(currentIndex),
        bold: false
      });
    }

    return textRuns.length > 0 ? textRuns : [{ text, bold: false }];
  };

  const downloadAsDOCX = async () => {
    try {
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          children: parseResumeToDocx(resume)
        }]
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CJ_Britz_Resume_${analysisResults?.role || 'Product_Manager'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating DOCX:', error);
      alert('Error generating DOCX. Please try again.');
    }
  };

  const parseResumeToDocx = (content) => {
    const lines = content.split('\n');
    const children = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        // Empty line - add spacing
        children.push(new Paragraph({ spacing: { after: 200 } }));
        return;
      }

      // Handle headers (lines starting with **)
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        const headerText = trimmedLine.replace(/\*\*/g, '');
        if (headerText.includes('|')) {
          // Company and location header
          children.push(new Paragraph({
            children: [new TextRun({ text: headerText, bold: true, size: 24 })],
            spacing: { before: 400, after: 200 }
          }));
        } else {
          // Section headers
          children.push(new Paragraph({
            children: [new TextRun({ text: headerText, bold: true, size: 28, allCaps: true })],
            spacing: { before: 600, after: 300 },
            border: { bottom: { size: 1, space: 1 } }
          }));
        }
        return;
      }

      // Handle role and period (lines starting with ** but not ending with **)
      if (trimmedLine.startsWith('**') && !trimmedLine.endsWith('**')) {
        const roleText = trimmedLine.replace(/\*\*/g, '');
        children.push(new Paragraph({
          children: [new TextRun({ text: roleText, bold: true, size: 22 })],
          spacing: { before: 300, after: 200 }
        }));
        return;
      }

      // Handle bullet points
      if (trimmedLine.startsWith('•')) {
        const bulletText = trimmedLine.substring(1).trim();
        // Parse bold text within bullet points
        const textRuns = parseBoldText(bulletText);
        children.push(new Paragraph({
          children: [
            new TextRun({ text: '• ', size: 20 }),
            ...textRuns
          ],
          spacing: { before: 100, after: 100 },
          indent: { left: 720 } // 0.5 inch indent
        }));
        return;
      }

      // Handle regular text
      if (trimmedLine) {
        const textRuns = parseBoldText(trimmedLine);
        children.push(new Paragraph({
          children: textRuns,
          spacing: { before: 100, after: 100 }
        }));
      }
    });

    return children;
  };

  const parseBoldText = (text) => {
    const textRuns = [];
    let currentIndex = 0;
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold section
      if (match.index > currentIndex) {
        textRuns.push(new TextRun({
          text: text.slice(currentIndex, match.index),
          size: 20
        }));
      }

      // Add the bold text
      textRuns.push(new TextRun({
        text: match[1],
        bold: true,
        size: 20
      }));

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      textRuns.push(new TextRun({
        text: text.slice(currentIndex),
        size: 20
      }));
    }

    return textRuns.length > 0 ? textRuns : [new TextRun({ text, size: 20 })];
  };

  const formatResumeContent = (content) => {
    // Convert markdown-style content to HTML with proper formatting
    return content
      .split('\n')
      .map((line, index) => {
        // Handle headers (lines starting with **)
        if (line.startsWith('**') && line.endsWith('**')) {
          const headerText = line.replace(/\*\*/g, '');
          if (headerText.includes('|')) {
            // Company and location header
            return `<h3 class="text-lg font-bold text-gray-800 mb-1">${headerText}</h3>`;
          } else {
            // Section headers
            return `<h2 class="text-xl font-bold text-gray-900 mb-3 mt-6 border-b border-gray-300 pb-2">${headerText}</h2>`;
          }
        }
        
        // Handle role and period (lines starting with ** but not ending with **)
        if (line.startsWith('**') && !line.endsWith('**')) {
          const roleText = line.replace(/\*\*/g, '');
          return `<h4 class="text-md font-semibold text-gray-700 mb-1">${roleText}</h4>`;
        }
        
        // Handle bullet points
        if (line.trim().startsWith('•')) {
          let bulletText = line.trim().substring(1).trim();
          // Convert bold text within bullet points
          bulletText = bulletText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return `<li class="text-sm text-gray-700 mb-1 leading-relaxed">${bulletText}</li>`;
        }
        
        // Handle empty lines
        if (line.trim() === '') {
          return '<br>';
        }
        
        // Handle regular text
        if (line.trim()) {
          let text = line;
          // Convert bold text within regular lines
          text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return `<p class="text-sm text-gray-700 mb-1">${text}</p>`;
        }
        
        return '';
      })
      .join('');
  };

  if (!resume) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 border border-gray-300 rounded-lg">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Your tailored resume will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Download Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={downloadAsPDF}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
        <button
          onClick={downloadAsDOCX}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download DOCX</span>
        </button>
      </div>

      {/* Resume Preview */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        {/* Resume Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Generated Resume</h3>
              {analysisResults && (
                <p className="text-sm text-gray-600">
                  {analysisResults.role} • {analysisResults.industry} • {analysisResults.matchScore}% Match
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
              <p className="text-xs text-gray-500">C.J. Britz</p>
            </div>
          </div>
        </div>

        {/* Resume Content */}
        <div 
          ref={resumeRef}
          className="p-8 bg-white"
          style={{ 
            fontFamily: 'Georgia, serif',
            fontSize: '12px',
            lineHeight: '1.4',
            color: '#333',
            maxWidth: '8.5in',
            margin: '0 auto'
          }}
        >
          <div 
            dangerouslySetInnerHTML={{ 
              __html: formatResumeContent(resume) 
            }}
            className="resume-content"
            style={{
              fontSize: '10px',
              lineHeight: '1.3',
              fontFamily: 'Times New Roman, serif'
            }}
          />
        </div>
      </div>

      {/* Analysis Summary */}
      {analysisResults && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Resume Optimization Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Target Role:</span> {analysisResults.role}
            </div>
            <div>
              <span className="font-medium">Industry Focus:</span> {analysisResults.industry}
            </div>
            <div>
              <span className="font-medium">Match Score:</span> 
              <span className="font-bold text-green-600 ml-1">{analysisResults.matchScore}%</span>
            </div>
            <div>
              <span className="font-medium">Key Requirements:</span> {analysisResults.keyRequirements.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeOutput; 