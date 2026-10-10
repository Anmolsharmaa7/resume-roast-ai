import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Analyze Resume
export const analyzeResume = async (resumeText, jobDescription) => {
  const prompt = `
You are a blunt, expert ATS (Applicant Tracking System) and career consultant.

Analyze the following resume against the provided job description.

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

You must return a JSON object following this EXACT schema:

{
  "overallScore": number,
  "atsScore": number,
  "jobMatchScore": number,
  "summary": "string",
  "sectionScores": [
    {
      "section": "string",
      "score": number,
      "issues": ["string"],
      "feedback": ["string"]
    }
  ],
  "missingKeywords": [
    {
      "keyword": "string",
      "importance": "high" | "medium" | "low",
      "reason": "string"
    }
  ],
  "matchedKeywords": ["string"],
  "weakBullets": [
    {
      "original": "string",
      "problem": "string",
      "suggestion": "string"
    }
  ],
  "formattingIssues": ["string"],
  "strengths": ["string"],
  "priorityFixes": ["string"]
}

CRITICAL RULES:
1. Be blunt but constructive.
2. NEVER fabricate information.
3. If a skill or experience is missing, report it as missing.
4. Do not use generic praise.
5. Scores must be between 0 and 100.
6. Return ONLY the JSON object.
`;

  const response = await openai.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: {
      type: 'json_object',
    },
  });

  return JSON.parse(response.choices[0].message.content);
};


// Improve Resume
export const improveResume = async (
  resumeText,
  analysis,
  jobDescription
) => {
  const prompt = `
You are an expert resume writer.

Improve the provided resume based on the AI analysis and target job description.

ORIGINAL RESUME:
${resumeText}

ANALYSIS:
${JSON.stringify(analysis)}

JOB DESCRIPTION:
${jobDescription}

Return a JSON object with the improved resume content using this EXACT structure:

{
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "portfolio": "string"
  },
  "summary": "string",
  "experience": [
    {
      "company": "string",
      "role": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "details": ["string"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "role": "string",
      "link": "string",
      "duration": "string",
      "bullets": ["string"]
    }
  ],
  "skills": {
    "technical": ["string"],
    "soft": ["string"],
    "tools": ["string"]
  },
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string"
    }
  ],
  "achievements": ["string"]
}

CRITICAL RULES:
1. Preserve all factual information from the original resume.
2. Improve wording and bullet points using strong action verbs.
3. Use measurable impact ONLY when the original resume provides enough information.
4. NEVER invent companies, degrees, jobs, skills, achievements, dates, or numbers.
5. Incorporate keywords from the job description ONLY when they are truthful.
6. Keep the resume professional and ATS-friendly.
7. Return ONLY the JSON object.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: {
      type: 'json_object',
    },
  });

  return JSON.parse(response.choices[0].message.content);
};