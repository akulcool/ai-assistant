import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Pinecone } =  require("@pinecone-database/pinecone");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
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
const m2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });




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

  async function modifyContent(modificationInput, currentJson,category) {
    if(category=="bracket"||category=="gears"){
    try {
      const prompt = `
      JSON State:
      ${currentJson}
      
      Rules:
      1. Make ONLY the modifications specified in the input.
      2. Adhere to JSON format strictly and give the full json as output.
  
      Modification Instructions:
      ${modificationInput}
      `; 
  
      // Add knowledge base content to the prompt to guide the AI
      const result = await m2.generateContent(prompt); 
  
      const output = result.response.text();

      const jsonMatch = output.match(/{[\s\S]*}/);
  
      
      return jsonMatch[0]
    } catch (error) {
      throw error;
    }
  }
  else if(category=="enclosure"){
    try {

      const res= JSON.parse(currentJson);
      const cutoutJson = res.cutoutJson;
      const enclosureJson = res.generatedJson;
      const prompt = `
      JSON State:
      ${enclosureJson}
      
      Rules:
      1. Make ONLY the modifications specified in the input.
      2. Adhere to JSON format strictly.
      3.the 'color' field must be in HEX format only and nothing else will be accepted
  
      Modification Instructions:
      ${modificationInput}
      `; 
  
      // Add knowledge base content to the prompt to guide the AI
      const result = await m2.generateContent(prompt  + "the type for cutouts is always custom, and the position can only take up the following values: top, bottom, right, left, front, back." + "If the user demands for any additional cutouts add them in accordance with the coordinate system so that the CAD model generates perfectly"); 
  
      const output = result.response.text();
      const j = output.match(/{[\s\S]*}/);
      const cuts = j[0];
      console.log(cutoutJson);
      const promptc = `
      JSON State:
      ${JSON.stringify(cutoutJson)}
      
      Rules:
      1)look at the cutout section of the data in this json ${cuts}, using only that section and the needed values approach task 2
      2)return the cutout json only having componentname,position,suitablelength and suitablewidth and nothing more.DO NOT CAPITALIZE OR PROVIDE ANY KIND OF UNNECESSARY GAPS IN THE JSON Keys mentioned.the json key:componentname stays 'componentname' always. NO NEED TO CAPITALIZE OR DO ANY EXTRA FORMATTING
      `; 
  
      const mod_cutouts = await m2.generateContent(promptc);
      
      const table = mod_cutouts.response.text();
      console.log(table)
      const jsonMatch = output.match(/{[\s\S]*}/);
      const match = table.match(/\[.*\]/s);
      console.log(match[0])
      const json2 = match[0];
  
       const clean_json=jsonMatch[0]
  
      
      return { generatedJson: clean_json , cutoutJson: JSON.parse(json2) };
    } catch (error) {
      throw error;
    }



  }
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

    console.log(response_json);
    const readline = require('readline/promises');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    let mod = await rl.question("Do you want modification in the current state? (yes/no): ");

    while (mod.toLowerCase() === "yes") {
        let modificationInput = await rl.question("Enter your modification: ");
        
        try {
            response_json = await modifyContent(modificationInput, JSON.stringify(response_json), category);
            console.log("Updated Response JSON:", response_json);
        } catch (error) {
            console.error("Error modifying content:", error);
        }

        mod = await rl.question("Do you want another modification? (yes/no): ");
    }

    console.log("Final JSON:", response_json);
    rl.close();




    return { response: response_json };
  
  }

  generateContent("create an enclosure for a raspberry pi 4B ");

