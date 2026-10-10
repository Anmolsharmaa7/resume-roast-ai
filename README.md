# ResumeRoast AI 🚀

ResumeRoast AI is a full-stack resume analysis and improvement platform. It uses AI to provide blunt, constructive feedback on resumes, checks them against ATS criteria and target job descriptions, and helps users build an optimized, professional resume.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL
- **AI**: OpenAI GPT-4o
- **Tools**: JWT, bcryptjs, Multer, Puppeteer (PDF Generation)

## 🚀 Getting Started

### Prerequisites

- Node.js (ARM64 for Mac M1/M2/M3)
- PostgreSQL (or use Docker)
- OpenAI API Key

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd resume-roast-ai
   ```

2. **Database Setup**
   ```bash
   docker compose up -d
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env # Update with your OpenAI key and DB URL
   npx prisma migrate dev --name init
   npm run dev
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 🗺 API Overview

### Auth
- `POST /api/auth/signup` - Create a new account
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current user profile

### Resumes
- `POST /api/resumes/upload` - Upload PDF/DOCX and extract text
- `GET /api/resumes` - List all user resumes
- `POST /api/resumes/:id/analyze` - Run AI ATS analysis
- `GET /api/resumes/:id/analysis` - Get latest analysis results
- `POST /api/resumes/:id/improve` - Generate AI-improved resume version
- `GET /api/resumes/:id/versions` - List all versions of a resume
- `PUT /api/resumes/:id/versions/:versionId` - Update resume content
- `GET /api/resumes/:id/download` - Download final resume as PDF

## 🧪 Testing Checklist

- [ ] User can sign up and log in
- [ ] User can upload PDF and DOCX files
- [ ] AI analysis generates a structured JSON response
- [ ] Analysis results are displayed correctly in the frontend
- [ ] AI improvement generates a factual, optimized version
- [ ] User can edit the improved resume in the builder
- [ ] Final resume downloads as a selectable-text PDF
- [ ] All endpoints enforce user ownership (no ID spoofing)
# resume-roast-ai
