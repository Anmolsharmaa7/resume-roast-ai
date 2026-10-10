import puppeteer from 'puppeteer';

export const generateResumePDF = async (resumeContent) => {
  const browser = await puppeteer.launch({
    headless: 'new',
  });
  const page = await browser.newPage();

  // Simple HTML template for the resume
  const html = `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; margin: 40px; color: #333; line-height: 1.5; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
          .contact { font-size: 12px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; border-bottom: 1px solid #ccc; margin-bottom: 10px; text-transform: uppercase; font-size: 14px; }
          .entry { margin-bottom: 15px; }
          .entry-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; }
          .entry-sub { font-style: italic; font-size: 12px; margin-bottom: 5px; }
          .bullets { margin: 0; padding-left: 20px; font-size: 12px; }
          .bullets li { margin-bottom: 3px; }
          .skills-grid { display: grid; grid-template-columns: 1fr 1fr; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${resumeContent.personalInfo.name}</h1>
          <div class="contact">
            ${resumeContent.personalInfo.email} | ${resumeContent.personalInfo.phone} | ${resumeContent.personalInfo.location}
            ${resumeContent.personalInfo.linkedin ? ` | LinkedIn: ${resumeContent.personalInfo.linkedin}` : ''}
            ${resumeContent.personalInfo.portfolio ? ` | Portfolio: ${resumeContent.personalInfo.portfolio}` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Professional Summary</div>
          <p style="font-size: 12px;">${resumeContent.summary}</p>
        </div>

        <div class="section">
          <div class="section-title">Experience</div>
          ${resumeContent.experience.map(exp => `
            <div class="entry">
              <div class="entry-header">
                <span>${exp.company}</span>
                <span>${exp.startDate} - ${exp.endDate}</span>
              </div>
              <div class="entry-sub">${exp.role} | ${exp.location}</div>
              <ul class="bullets">
                ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">Education</div>
          ${resumeContent.education.map(edu => `
            <div class="entry">
              <div class="entry-header">
                <span>${edu.institution}</span>
                <span>${edu.startDate} - ${edu.endDate}</span>
              </div>
              <div class="entry-sub">${edu.degree} | ${edu.location}</div>
              <ul class="bullets">
                ${edu.details.map(d => `<li>${d}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">Projects</div>
          ${resumeContent.projects.map(proj => `
            <div class="entry">
              <div class="entry-header">
                <span>${proj.name}</span>
                <span>${proj.duration}</span>
              </div>
              <div class="entry-sub">${proj.role} ${proj.link ? `(${proj.link})` : ''}</div>
              <ul class="bullets">
                ${proj.bullets.map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills-grid">
            <div><strong>Technical:</strong> ${resumeContent.skills.technical.join(', ')}</div>
            <div><strong>Tools:</strong> ${resumeContent.skills.tools.join(', ')}</div>
            <div><strong>Soft Skills:</strong> ${resumeContent.skills.soft.join(', ')}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Certifications</div>
          <ul class="bullets">
            ${resumeContent.certifications.map(c => `<li>${c.name} - ${c.issuer} (${c.date})</li>`).join('')}
          </ul>
        </div>

        <div class="section">
          <div class="section-title">Achievements</div>
          <ul class="bullets">
            ${resumeContent.achievements.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>
      </body>
    </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
  });

  await browser.close();
  return pdfBuffer;
};
