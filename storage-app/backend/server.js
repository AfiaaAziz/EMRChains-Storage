const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;
const STORAGE_DIRECTORY = "storage";

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.status(200).json({ message: "Storage API is running correctly." });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const relativePath = req.query.path || "";
    const absolutePath = path.join(
      __dirname,
      "..",
      STORAGE_DIRECTORY,
      relativePath
    );
    fs.mkdirSync(absolutePath, { recursive: true });
    cb(null, absolutePath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.get("/list", (req, res) => {
  const relativePath = req.query.path || "";

  const absolutePath = path.join(
    __dirname,
    "..",
    STORAGE_DIRECTORY,
    relativePath
  );

  if (!fs.existsSync(absolutePath)) {
    if (relativePath === "") {
      fs.mkdirSync(absolutePath, { recursive: true });
      return res.json([]);
    }
    return res.status(404).json({ message: "Directory not found" });
  }

  try {
    const items = fs.readdirSync(absolutePath).map((item) => {
      const itemPath = path.join(absolutePath, item);
      const stats = fs.statSync(itemPath);
      return {
        name: item,
        isFolder: stats.isDirectory(),
        size: stats.size,
        mtime: stats.mtime,
      };
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to read directory", error });
  }
});

app.post("/create-folder", (req, res) => {
  const { folderName } = req.body;
  const relativePath = req.query.path || "";
  const absolutePath = path.join(
    __dirname,
    "..",
    STORAGE_DIRECTORY,
    relativePath,
    folderName
  );

  if (fs.existsSync(absolutePath)) {
    return res.status(409).json({ message: "Folder already exists" });
  }
  try {
    fs.mkdirSync(absolutePath);
    res.status(201).json({ message: "Folder created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create folder", error });
  }
});

app.post("/upload", upload.single("file"), (req, res) => {
  res.status(201).json({ message: "File uploaded successfully" });
});

app.get("/download", (req, res) => {
  const relativePath = req.query.path || "";

  const absolutePath = path.join(
    __dirname,
    "..",
    STORAGE_DIRECTORY,
    relativePath
  );

  if (fs.existsSync(absolutePath)) {
    res.download(absolutePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

app.delete("/delete", (req, res) => {
  const relativePath = req.query.path || "";
  const absolutePath = path.join(
    __dirname,
    "..",
    STORAGE_DIRECTORY,
    relativePath
  );

  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({ message: "Item not found" });
  }
  try {
    const stats = fs.statSync(absolutePath);
    if (stats.isDirectory()) {
      fs.rmdirSync(absolutePath, { recursive: true });
    } else {
      fs.unlinkSync(absolutePath);
    }
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete item", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});