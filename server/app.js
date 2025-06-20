import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import sharp from "sharp";
import OpenAI from "openai";
import supabase from "./supabase.js";
import { toFile } from "openai";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";

dotenv.config();

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

// Configure multer for handling file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// begin listening on a port
const port = process.env.PORT || 3500;

app.listen(port, () => {
  console.log("Server running on port", port);
});

app.get("/server-test", (req, res) => {
  res
    .status(200)
    .json("This text is coming from the backend server (app.js) ✅");
});

app.get("/db-test", async (req, res) => {
  try {
    const { data, error } = await supabase.from("todos").select("*").limit(5);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to fetch data from database" });
  }
});

app.post("/upload-image", upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  try {
    // Generate unique filename
    const key = `uploads/image-${Date.now()}-${Math.random().toString(36).substring(2)}.png`;
    
    // Convert image to PNG format using Sharp
    const processedImageBuffer = await sharp(req.file.buffer)
      .png()
      .toBuffer();

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: processedImageBuffer,
      ContentType: "image/png",
    });

    await s3.send(uploadCommand);
    
    // Generate the public URL
    const imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    
    res.status(200).json({
      success: true,
      imageUrl: imageUrl,
      message: "Image uploaded successfully"
    });
  } catch (err) {
    console.error("❌ Error uploading image:", err.message);
    res.status(500).json({ 
      error: "Image upload failed", 
      details: err.message 
    });
  }
});

app.post("/edit-image", async (req, res) => {
  const { imageUrl, prompt } = req.body;

  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: "imageUrl and prompt required" });
  }

  try {
    // Step 1: Download image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error("Image fetch failed");

    const arrayBuffer = await imageResponse.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Step 2: Convert to PNG in memory
    const processedImageBuffer = await sharp(imageBuffer)
      .resize(1024, 1024) // enforce square size
      .ensureAlpha() // add alpha channel if missing
      .png()
      .toBuffer();

    // Step 3: Send to OpenAI using buffer directly
    const openaiResponse = await openai.images.edit({
      model: "gpt-image-1",
      image: await toFile(processedImageBuffer, null, {
        type: "image/png",
      }),
      prompt,
      n: 1,
      size: "1024x1024",
    });

    const base64 = openaiResponse.data[0].b64_json;

    res.status(200).json({
      success: true,
      editedImageBase64: base64,
    });
  } catch (err) {
    console.error("❌ Error in image edit:", err.message);
    res
      .status(500)
      .json({ error: "Image editing failed", details: err.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV !== "dev") {
  // Serve static files from the 'dist' directory
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // Handle all other routes by serving index.html
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}
