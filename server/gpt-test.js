import OpenAI, { toFile } from "openai";
import { createReadStream, writeFileSync } from "fs";
import { resolve, join } from "path";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

async function editImageWithOpenAI(localPath, prompt) {
  try {
    const result = await openai.images.edit({
      model: 'gpt-image-1',
      image: await toFile(
        createReadStream(resolve(localPath)),
        null,
        { type: 'image/png' },
      ),
      prompt,
      n: 1,
      size: '1024x1024',
    });

    const base64 = result.data[0].b64_json;

    // Define output path
    const outputPath = "edited-image.png";

    // Write base64 image to file
    writeFileSync(outputPath, Buffer.from(base64, "base64"));

    console.log("✅ Image saved to:", outputPath);
    return outputPath;

  } catch (err) {
    console.error("❌ Error editing image:", err.message);
    throw err;
  }
}


editImageWithOpenAI(
    "./cat.png",
  "Make it more vibrant and colorful"
);

