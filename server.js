const express = require("express");
const fs = require("fs").promises; 
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const FILES_DIR = path.join(__dirname, "files");

async function ensureFilesDir() {
  try {
    await fs.mkdir(FILES_DIR, { recursive: true });
  } catch (err) {
    console.error("Error creating files directory:", err.message);
  }
}
ensureFilesDir();

function formatDate(now) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}-${String(
    now.getMinutes()
  ).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;
}


app.post("/files", async (req, res) => {
  try {
    const now = new Date();
    const fileName = `${formatDate(now)}.txt`;
    const filePath = path.join(FILES_DIR, fileName);

    await fs.writeFile(filePath, now.toString());

    res.status(201).json({
      message: "File created successfully",
      file: fileName,
    });
  } catch (err) {
    res.status(500).json({ error: "Error creating file", details: err.message });
  }
});


app.get("/files", async (req, res) => {
  try {
    const files = await fs.readdir(FILES_DIR);
    const txtFiles = files.filter((f) => f.endsWith(".txt"));

    res.json({ count: txtFiles.length, files: txtFiles });
  } catch (err) {
    res.status(500).json({ error: "Error reading files", details: err.message });
  }
});


app.get("/files/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(FILES_DIR, fileName);

    const content = await fs.readFile(filePath, "utf8");
    res.json({ file: fileName, content });
  } catch (err) {
    res.status(404).json({ error: "File not found" });
  }
});


app.delete("/files/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(FILES_DIR, fileName);

    await fs.unlink(filePath);
    res.json({ message: "File deleted successfully", file: fileName });
  } catch (err) {
    res.status(404).json({ error: "File not found or could not delete" });
  }
});


app.get("/", (req, res) => {
  res.json({
    message: "Node.js File System API",
    endpoints: {
      create: { method: "POST", url: "/files" },
      list: { method: "GET", url: "/files" },
      read: { method: "GET", url: "/files/:fileName" },
      delete: { method: "DELETE", url: "/files/:fileName" },
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
