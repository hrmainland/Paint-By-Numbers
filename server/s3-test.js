import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

async function testUpload() {
  const filePath = path.resolve("cat.png"); // 🐱 Replace with any test file
  const fileStream = fs.createReadStream(filePath);
  const key = `test-upload-${Date.now()}.png`;

  const uploadCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileStream,
    ContentType: "image/png", // Change if you're uploading another type
  });

  try {
    await s3.send(uploadCommand);
    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    console.log("✅ Upload successful!");
    console.log("📎 File URL:", url);
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
  }
}

testUpload();
