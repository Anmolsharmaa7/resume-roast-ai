import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import fs from 'fs/promises';

import { extractText } from '../utils/extract-text.js';
import {
  analyzeResume as aiAnalyzeResume,
  improveResume as aiImproveResume,
} from '../services/ai.service.js';
import { generateResumePDF } from '../services/pdf.service.js';

const prisma = new PrismaClient();

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload PDF or DOCX.'));
    }
  },
});

export { upload };

// Upload Resume
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded',
      });
    }

    const { targetJobDescription } = req.body;

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    const extractedText = await extractText(filePath, mimeType);

    await fs.unlink(filePath).catch(() => {});

    const resume = await prisma.resume.create({
      data: {
        userId: req.user.id,
        originalFilename: req.file.originalname,
        extractedText,
        targetJobDescription: targetJobDescription || null,
      },
    });

    res.status(201).json({
      success: true,
      resume: {
        id: resume.id,
        originalFilename: resume.originalFilename,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all resumes
export const getResumes = async (req, res, next) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        analyses: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedResumes = resumes.map((resume) => ({
      id: resume.id,
      name: resume.originalFilename,
      role: 'Analyze to see role',
      date: resume.createdAt,
      score: resume.analyses[0]?.overallScore || 0,
      status: resume.analyses[0] ? 'Analyzed' : 'Pending',
    }));

    res.status(200).json({
      success: true,
      resumes: formattedResumes,
    });
  } catch (error) {
    next(error);
  }
};

// Get single resume
export const getResume = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!resume) {
      return res.status(404).json({
        message: 'Resume not found',
      });
    }

    res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    next(error);
  }
};

// Analyze resume
export const analyzeResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { targetJobDescription } = req.body;

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!resume) {
      return res.status(404).json({
        message: 'Resume not found',
      });
    }

    const jobDescription =
      targetJobDescription || resume.targetJobDescription;

    if (!jobDescription) {
      return res.status(400).json({
        message: 'Target job description is required for analysis',
      });
    }

    const analysisData = await aiAnalyzeResume(
      resume.extractedText,
      jobDescription
    );

    await prisma.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        analysisData,
        overallScore: analysisData.overallScore,
        atsScore: analysisData.atsScore,
        jobMatchScore: analysisData.jobMatchScore,
      },
    });

    res.status(200).json({
      success: true,
      analysis: analysisData,
    });
  } catch (error) {
    next(error);
  }
};

// Get latest analysis
export const getAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;

    const analysis = await prisma.resumeAnalysis.findFirst({
      where: {
        resume: {
          id,
          userId: req.user.id,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!analysis) {
      return res.status(404).json({
        message: 'Analysis not found',
      });
    }

    res.status(200).json({
      success: true,
      analysis: analysis.analysisData,
    });
  } catch (error) {
    next(error);
  }
};

// Improve resume
export const improveResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { targetJobDescription } = req.body;

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!resume) {
      return res.status(404).json({
        message: 'Resume not found',
      });
    }

    const analysis = await prisma.resumeAnalysis.findFirst({
      where: {
        resumeId: resume.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!analysis) {
      return res.status(400).json({
        message: 'Analyze the resume before improving it',
      });
    }

    const jobDescription =
      targetJobDescription || resume.targetJobDescription;

    const improvedResume = await aiImproveResume(
      resume.extractedText,
      analysis.analysisData,
      jobDescription || ''
    );

    // Save improved version if the Prisma model exists
    try {
      await prisma.resumeVersion.create({
        data: {
          resumeId: resume.id,
          content: improvedResume,
        },
      });
    } catch (versionError) {
      console.log(
        'Resume version could not be saved:',
        versionError.message
      );
    }

    res.status(200).json({
      success: true,
      resume: improvedResume,
    });
  } catch (error) {
    next(error);
  }
};

// Get resume versions
export const getVersions = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!resume) {
      return res.status(404).json({
        message: 'Resume not found',
      });
    }

    const versions = await prisma.resumeVersion.findMany({
      where: {
        resumeId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      versions,
    });
  } catch (error) {
    next(error);
  }
};

// Update resume version
export const updateResumeVersion = async (req, res, next) => {
  try {
    const { id, versionId } = req.params;
    const { content } = req.body;

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!resume) {
      return res.status(404).json({
        message: 'Resume not found',
      });
    }

    const version = await prisma.resumeVersion.findFirst({
      where: {
        id: versionId,
        resumeId: id,
      },
    });

    if (!version) {
      return res.status(404).json({
        message: 'Resume version not found',
      });
    }

    const updatedVersion = await prisma.resumeVersion.update({
      where: {
        id: versionId,
      },
      data: {
        content,
      },
    });

    res.status(200).json({
      success: true,
      version: updatedVersion,
    });
  } catch (error) {
    next(error);
  }
};

// Download improved resume as PDF
export const downloadResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { versionId } = req.query;

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!resume) {
      return res.status(404).json({
        message: 'Resume not found',
      });
    }

    let resumeContent;

    if (versionId) {
      const version = await prisma.resumeVersion.findFirst({
        where: {
          id: versionId,
          resumeId: id,
        },
      });

      if (!version) {
        return res.status(404).json({
          message: 'Resume version not found',
        });
      }

      resumeContent = version.content;
    } else {
      const latestVersion = await prisma.resumeVersion.findFirst({
        where: {
          resumeId: id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!latestVersion) {
        return res.status(404).json({
          message: 'No improved resume version found',
        });
      }

      resumeContent = latestVersion.content;
    }

    const pdfBuffer = await generateResumePDF(resumeContent);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="improved-resume.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};