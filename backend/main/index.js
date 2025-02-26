import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Pinecone } =  require("@pinecone-database/pinecone");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Fuse = require("fuse.js"); // Import Fuse.js for fuzzy matching
const fs = require("fs-extra"); // Import the File System module


const app = express();
app.use(bodyParser.json());
app.use(cors());
require('dotenv').config({ path: require('find-config')('.env') })

if (!process.env.PINECONE_API_KEY) {
  throw new Error("Pinecone API Key is missing. Check your .env file.");
} 

// Initialize Pinecone
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
console.log("Pinecone set up!!");

// Initialize Pinecone index
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyA2iDVWxSJBHFp3OcpGj_ftryE28FPnZLA");
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });




async function generateEmbedding(text) {
  try {
    const result = await model.embedContent(text);
    // Gemini returns embeddings in a vector form, so we can extract it from the response
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return [];
  }
}

async function retrieveAnswer(query) {
  const vector = await generateEmbedding(query);
  const response = await index.query({
    vector,
    topK: 1,
    includeMetadata: true,
  });

  if (response.matches.length > 0) {
    return response.matches[0].metadata.answer;
  }

  return "Sorry, I couldn't find an answer.";
}



  async function classifyPrompt(context) {
    const answer = await retrieveAnswer(context);
    console.log("Answer:", answer);
    return answer;
  }
  
  async function generateContent(context) {
    let response_json = "{}";
  
    const category = await classifyPrompt(context);
    
    try {
      const modelPath = `./${category}/index.js`;
      const modelGenerator = await import(modelPath);
      
      response_json = await modelGenerator.default(context); // Call the function from the respective module
    } catch (error) {
      console.error("Error loading model generator:", error);
      response_json = JSON.stringify({ error: `Failed to generate 3D model for category: ${category}` });
    }
    console.log(response_json)
  
    return { response: response_json };
  }

app.post("/generate", async (req, res) => {
    const { context } = req.body;
    if (!context) {
        return res.status(400).json({ error: "Context is required" });
    }

    try {
        const response = await generateContent(context);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

