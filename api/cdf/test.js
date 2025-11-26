export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: "Test-function kører",
    cwd: process.cwd(),
    files: fs ? "fs available" : "no fs"
  });
}

import fs from "fs";
