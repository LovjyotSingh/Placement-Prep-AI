const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ai = require('../services/ai.service');

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
  }
});

exports.uploadMiddleware = upload.single('resume');

// POST /api/resume/analyze
exports.analyzeResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ status: 'error', message: 'Please upload a resume file' });

    const targetRole = req.body.targetRole || req.user.targetRole || 'SDE';
    let resumeText = '';

    // Read file as text (works for .txt; for PDF/DOCX install pdf-parse/mammoth)
    try {
      if (req.file.mimetype === 'application/pdf') {
        // Try to use pdf-parse if installed
        try {
          const pdfParse = require('pdf-parse');
          const dataBuffer = fs.readFileSync(req.file.path);
          const pdfData = await pdfParse(dataBuffer);
          resumeText = pdfData.text;
        } catch {
          resumeText = 'PDF content - please ensure pdf-parse package is installed';
        }
      } else if (req.file.originalname.endsWith('.docx')) {
        try {
          const mammoth = require('mammoth');
          const result = await mammoth.extractRawText({ path: req.file.path });
          resumeText = result.value;
        } catch {
          resumeText = 'DOCX content - please ensure mammoth package is installed';
        }
      } else {
        resumeText = fs.readFileSync(req.file.path, 'utf8');
      }
    } catch (readErr) {
      resumeText = 'Could not fully read file';
    }

    const analysis = await ai.analyzeResume(resumeText, targetRole);

    // Clean up uploaded file
    try { fs.unlinkSync(req.file.path); } catch {}

    res.json({ status: 'success', data: { fileName: req.file.originalname, targetRole, analysis } });
  } catch (err) {
    console.error('Resume analysis error:', err);
    res.status(500).json({ status: 'error', message: err.message || 'Resume analysis failed' });
  }
};
