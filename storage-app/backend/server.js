
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const STORAGE_DIR = path.resolve(process.env.STORAGE_DIR || path.join(__dirname, 'storage'));


if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });


function safeJoin(base, userPath = '') {
  const target = path.join(base, userPath || '');
  const resolved = path.resolve(target);
  if (!resolved.startsWith(base)) throw new Error('Invalid path');
  return resolved;
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const rel = req.query.path || '';
      const dest = safeJoin(STORAGE_DIR, rel);
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    
    cb(null, file.originalname);
  }
});
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } }); // 200MB


app.get('/list', (req, res) => {
  try {
    const rel = req.query.path || '';
    const dir = safeJoin(STORAGE_DIR, rel);
    if (!fs.existsSync(dir)) return res.json([]);
    const names = fs.readdirSync(dir);
    const items = names.map(name => {
      const full = path.join(dir, name);
      const stat = fs.lstatSync(full);
      return {
        name,
        isFolder: stat.isDirectory(),
        size: stat.isFile() ? stat.size : null,
        mtime: stat.mtime
      };
    });
    res.json(items);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


app.post('/create-folder', (req, res) => {
  try {
    const rel = req.query.path || '';
    const { folderName } = req.body;
    if (!folderName) return res.status(400).json({ message: 'folderName required' });
    const newFolder = safeJoin(STORAGE_DIR, path.join(rel, folderName));
    if (fs.existsSync(newFolder)) return res.status(400).json({ message: 'Folder exists' });
    fs.mkdirSync(newFolder, { recursive: true });
    res.json({ message: 'Folder created' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ message: 'Uploaded', file: { originalname: req.file.originalname } });
});


app.get('/download', (req, res) => {
  try {
    const rel = req.query.path;
    if (!rel) return res.status(400).json({ message: 'path required' });
    const full = safeJoin(STORAGE_DIR, rel);
    if (!fs.existsSync(full) || fs.lstatSync(full).isDirectory()) return res.status(404).json({ message: 'Not found' });
    res.download(full);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
