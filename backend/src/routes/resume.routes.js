import express from 'express';
import {
  uploadResume,
  getResumes,
  getResume,
  analyzeResume,
  getAnalysis,
  improveResume,
  getVersions,
  updateResumeVersion,
  downloadResume,
  upload,
} from '../controllers/resume.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.post('/:id/analyze', analyzeResume);
router.get('/:id/analysis', getAnalysis);
router.post('/:id/improve', improveResume);
router.get('/:id/versions', getVersions);
router.put('/:id/versions/:versionId', updateResumeVersion);
router.get('/:id/download', downloadResume);

export default router;
