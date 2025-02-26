import { createRequire } from 'module';
import { MIMEType } from 'util';
const require = createRequire(import.meta.url);
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs-extra');
const genAI = new GoogleGenerativeAI("AIzaSyA2iDVWxSJBHFp3OcpGj_ftryE28FPnZLA");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const sheet_info="Context:create a U Bracket.1)Task:Which type of bracket will be suitable for use here. The options you have:L Bracket,Z Bracket,U Bracket,Offset Bracket.\n2)strictly choose only out of the 4 options above.";
const split_res = await model.generateContent(sheet_info)
const sheet_type = split_res.response.text().toString()
console.log(sheet_type)
const validPrefixes = new Set(["L", "U", "Z", "Offset", "T"]);
const matches = [];
const words = sheet_type.split(/\s+/);
for (let i = 0; i < words.length; i++) {
 
  const word = words[i].replace(/[^\w-]/g, ''); 
  

  const hyphenMatch = word.match(/^([A-Z][a-z]*)-bracket$/i); 
  const spaceMatch = word.match(/^([A-Z][a-z]*)$/) && words[i + 1] === "Bracket";

  if (hyphenMatch && validPrefixes.has(hyphenMatch[1])) {
    matches.push(`${hyphenMatch[1]}-bracket`);
  } else if (spaceMatch && validPrefixes.has(word)) {
    matches.push(`${word} Bracket`);
  }
}
function parseTable(table) {
    const lines = table.trim().split('\n'); // Split table into lines
    const data = {};
  
    // Skip the header and divider (first 2 lines)
    for (let i = 2; i < lines.length; i++) {
      const row = lines[i].split('|').map(cell => cell.trim()); // Split each row by '|'
      const parameter = row[1]; // Parameter column
      const value = parseFloat(row[2]); // Convert Value to number
      data[parameter] = value; // Store in an object
    }
  
    return data;
  }
      
    
      let dimension_table="";
      const promptb = "Context:Generate a clamp for a pipe with a height 120\n. Task:Using the below image and guidelines provide length1,length2,length3 and width for the"+usable_bracket+ "bracket\n2)Print the result in tabular form \n3)One column for the label and the other for values.Print only the table and all labels must be in smallcase"
      const image = {
      inlineData:{
          data:Buffer.from(fs.readFileSync("U.png")).toString("base64"),
          mimeType:"image/png",
      },
      };
      console.log("Detected bracket:", matches[0]);

      try {
        const resultb = await model.generateContent([promptb, image]);
        dimension_table = resultb.response.text();
    } catch (error) {
        console.error("Error fetching AI-generated dimensions:", error);
        return;
    }

      const parsedData = parseTable(dimension_table);
      if (!parsedData || typeof parsedData !== "object") {
        console.error("Error: Failed to parse AI-generated table.");
        return;
    }
    


      const length1=parsedData['length1']
      const length2=parsedData['length2']
      const length3=parsedData['length3']
      const width=parsedData['width']
      
      // Log the extracted values
      console.log(`Length 1: ${length1}`);
      console.log(`Length 2: ${length2}`);
      console.log(`Length 3: ${length3}`);
      console.log(`Width: ${width}`);
      async function  generate_u_bracket(usable_bracket){
  
        const bracketConfig = `{
            "show2d": true,
            "show3d": true,
            "bracketsType": "U Bracket",
            "dimensionType": "Inner Faces",
            "material": "Mild Steel",
            "kfactor": "0.5",
            "bracketDimensions": {
              "length1":${length1} ,
              "length2":${length2} ,
              "length3":${length2} ,
              "length4": ,
              "length5": ,
              "width": ,
              "offSetType": "Inner",
              "thickness": 2
            },
            "holes": [
              {
                "holeDiameter": ,
                "position": "",
                "Xvalue": ,
                "Zvalue": 
              }
            ],
            "patterns": [
              {
                "type": "Circular",
                "position": "",
                "numberOfPattern": 4,
                "holeSize": 5,
                "distancebetweenPattern": 10,
                "Zvalue": 20,
                "Xvalue": 0,
                "length": 10,
                "width": 20,
                "radius": 2
              }
            ]
          }`;

      const hole_json= `"holes": [
        {
          "holeDiameter": ,
          "position": "",
          "Xvalue": ,
          "Zvalue": 
        }
      ]`

      const pattern_json=`"patterns": [
          {
            "type": "Circular",
            "position": "",
            "numberOfPattern": ,
            "holeSize": ,
            "distancebetweenPattern": ,
            "Zvalue": ,
            "Xvalue": ,
            "length": ,
            "width": ,
            "radius": 
          }
        ]`
        const promptf = "Context:Generate a clamp for a pipe with a height 120\n. 1)The image here shows the face profile i.e which face is L1,L2 and L3 along with a few examples of holes and patterns. These are representative examples for reference do not use the exact ones \n2)use the context to identify the need of patterns and holes on each face.\n3)print the result in tabular form where one column is the face{L1,L2 or L3},column 2 is hole or pattern. If we choose hole then one column for hole diameter but if pattern is chosen then mention number of patterns,distance between each element and shape along with radius for circular or length/width if rectangular is chosen all of which can be put in a details column.\n3)Dimensions are:Lengths:"+length1+"and"+length2 +"and height is"+width
        const imagef = {
        inlineData:{
            data:Buffer.from(fs.readFileSync("Faceprofile.png")).toString("base64"),
            mimeType:"image/png",
        },
        };
        const result_cuts = await model.generateContent([promptf,imagef]);
       const  cuts_table= result_cuts.response.text();
         console.log(cuts_table)
         const promptL1 = " 1)The image provided shows the profile of face L1 with the maximum length along x  being:"+length1+"and along z being"+ width+"\n2)Use the table provided:"+cuts_table+"to get the positioning of the cutouts or patterns mentioned for L1.Use the exact data from the table only and only for the case of L1. USE THE TABLE DATA ONLY AND ONLY FOR THE FACE L1 DO NOT INCLUDE ANYTHING EXTRA.If no holes or patterns are there leave that part blank . Avoid all cases of overlaps and ensure that the cutouts are within the boundaries\n3)Response should be in json format: for holes:"+hole_json+"for patterns: "+pattern_json+"the position in all cases is {L1}"
        const imageL1 = {
        inlineData:{
            data:Buffer.from(fs.readFileSync("L1.png")).toString("base64"),
            mimeType:"image/png",
        },
        };
        const result_L1 = await model.generateContent([promptL1,imageL1]);
        const  cuts_L1= result_L1.response.text();
         console.log(cuts_L1)
         const promptL2 = " 1)The image provided shows the profile of face L2 with the maximum length along x  being:"+length2+"and along z being"+ width+"\n2)Use the table provided:"+cuts_table+"to get the positioning of the cutouts or patterns mentioned for L2.Use the exact data from the table only and only for the case of L2. USE THE TABLE DATA ONLY AND ONLY FOR THE FACE L1 DO NOT INCLUDE ANYTHING EXTRA.If no holes or patterns are there leave that part blank . Avoid all cases of overlaps and ensure that the cutouts are within the boundaries\n3)Response should be in json format: for holes:"+hole_json+"for patterns: "+pattern_json+"the position in all cases is {L2}"
         const imageL2 = {
         inlineData:{
             data:Buffer.from(fs.readFileSync("L2.png")).toString("base64"),
             mimeType:"image/png",
         },
         }; 
         const result_L2 = await model.generateContent([promptL2,imageL2]);
         const  cuts_L2= result_L2.response.text();
          console.log(cuts_L2)
         const promptL3 = " 1)The image provided shows the profile of face L3 with the maximum length along x  being:"+length2+"and along z being"+ width+"\n2)Use the table provided:"+cuts_table+"to get the positioning of the cutouts or patterns mentioned for L3.Use the exact data from the table only and only for the case of L3. USE THE TABLE DATA ONLY AND ONLY FOR THE FACE L1 DO NOT INCLUDE ANYTHING EXTRA.If no holes or patterns are there leave that part blank . Avoid all cases of overlaps and ensure that the cutouts are within the boundaries\n3)Response should be in json format: for holes:"+hole_json+"for patterns: "+pattern_json+"the position in all cases is {L3}"
         const imageL3 = {
         inlineData:{
             data:Buffer.from(fs.readFileSync("L3.png")).toString("base64"),
             mimeType:"image/png",
         },
         };
         
         const result_L3 = await model.generateContent([promptL3,imageL3]);
         const  cuts_L3= result_L3.response.text();
          console.log(cuts_L3)
          if (!cuts_L1 || !cuts_L2 || !cuts_L3) {
            console.error("Error: Missing cutout data.");
            return;
        }
        
          const finalprompt = "create a sheet metal in the json format as shown"+bracketConfig +"using the following data:\n1)for sizes use this data length1:"+length1+"length2:"+length2+"length3:"+length3+"width:"+width+"length4 and length5 is always 100\n for L1 holes and patterns STRICTLY USE"+cuts_L1+"\n for L2 Holes and patterns use STRICTLY"+cuts_L2+"\n for L3 holes and patterns use STRICTLY"+cuts_L3+"\n The form json provides 2 rectangular options one is {Horizontal Rounded Corner Rectangle} and another is {Vertical Rounded Corner Rectangle}. If in case patterns are rectangular choose exactly one type from here and also fix length and width according to whats been provided only\n print final json only and no extra text and please NO NULL VALUES"
          const finalJSON=await model.generateContent(finalprompt)
          console.log(finalJSON.response.text())
}
async function  generate_l_bracket(usable_bracket){
    const bracketConfig = `{
        "show2d": true,
        "show3d": true,
        "bracketsType": "L Bracket",
        "dimensionType": "Inner Faces",
        "material": "Mild Steel",
        "kfactor": "0.5",
        "bracketDimensions": {
          "length1": ${length1},
          "length2": ${length2},
          "length3": ,
          "length4": ,
          "length5": ,
          "width": ,
          "offSetType": "Inner",
          "thickness": 2
        },
        "holes": [
          {
            "holeDiameter": ,
            "position": "",
            "Xvalue": ,
            "Zvalue": 
          }
        ],
        "patterns": [
          {
            "type": "Circular",
            "position": "",
            "numberOfPattern": 4,
            "holeSize": 5,
            "distancebetweenPattern": 10,
            "Zvalue": 20,
            "Xvalue": 0,
            "length": 10,
            "width": 20,
            "radius": 2
          }
        ]
      }`;      
    
      let dimension_table="";
      const promptb = "Context:Generate a clamp for a pipe with a height 120\n. Task:Using the below image and guidelines provide length1,length2 and width for the"+usable_bracket+ "bracket\n2)Print the result in tabular form print table only\n3)One column for the label(all label values are to be in smallcase) and the other for value"
      const image = {
      inlineData:{
          data:Buffer.from(fs.readFileSync("L.png")).toString("base64"),
          mimeType:"image/png",
      },
      };
      
      const resultb = await model.generateContent([promptb,image]);
       dimension_table = resultb.response.text();

        
      const parsedData = parseTable(dimension_table);
      if (!parsedData || typeof parsedData !== "object") {
        console.error("Error: Failed to parse AI-generated table.");
        process.exit(1);
    }
    
      console.log(parsedData)

      const length1=parsedData['length1']
      const length2=parsedData['length2']
      const width=parsedData['width']
      
      // Log the extracted values
      console.log(`Length 1: ${length1}`);
      console.log(`Length 2: ${length2}`);
      console.log(`Width: ${width}`);

      const hole_json= `"holes": [
        {
          "holeDiameter": ,
          "position": "",
          "Xvalue": ,
          "Zvalue": 
        }
      ]`

      const pattern_json=`"patterns": [
          {
            "type": "Circular",
            "position": "",
            "numberOfPattern": ,
            "holeSize": ,
            "distancebetweenPattern": ,
            "Zvalue": ,
            "Xvalue": ,
            "length": ,
            "width": ,
            "radius": 
          }
        ]`
     
        const promptf = "Context:Generate a clamp for a pipe with a height 120\n. 1)The image here shows the face profile i.e which face is L1 and L2 along with a few examples of holes and patterns. These are representative examples for reference do not use the exact ones \n2)use the context to identify the need of patterns and holes on each face.\n3)print the result in tabular form where one column is the face{L1 or L2},column 2 is hole or pattern. If we choose hole then one column for hole diameter but if pattern is chosen then mention number of patterns,distance between each element and shape along with radius for circular or length/width if rectangular is chosen all of which can be put in a details column.\n3)Dimensions are:Lengths:"+length1+"and"+length2 +"and height is"+width
        const imagef = {
        inlineData:{
            data:Buffer.from(fs.readFileSync("LF.png")).toString("base64"),
            mimeType:"image/png",
        },
        };
        
        const result_cuts = await model.generateContent([promptf,imagef]);
       const  cuts_table= result_cuts.response.text();
         console.log(cuts_table)


         const promptL1 = " 1)The image provided shows the profile of face L1 with the origin at the bottom middle. The x ranges are:"+ -length1/2 +"to"+length1/2+"and z ranges from 0 to "+width+"\n2)Use the table provided:"+cuts_table+"to get the positioning of the cutouts or patterns mentioned for L1.Use the exact data from the table only and only for the case of L1. USE THE TABLE DATA ONLY AND ONLY FOR THE FACE L1 DO NOT INCLUDE ANYTHING EXTRA.If no holes or patterns are there leave that part blank . Avoid all cases of overlaps and ensure that the cutouts are within the boundaries\n3)Response should be in json format: for holes:"+hole_json+"for patterns: "+pattern_json+"the position in all cases is {L1}"
        const imageL1 = {
        inlineData:{
            data:Buffer.from(fs.readFileSync("LL1.png")).toString("base64"),
            mimeType:"image/png",
        },
        };
        
        const result_L1 = await model.generateContent([promptL1,imageL1]);
        const  cuts_L1= result_L1.response.text();
         console.log(cuts_L1)

        


         const promptL2 = " 1)The image provided shows the profile of face L2 with the maximum length along x  being:"+length2+"and along z being"+ width+"\n2)Use the table provided:"+cuts_table+"to get the positioning of the cutouts or patterns mentioned for L2.Use the exact data from the table only and only for the case of L2. USE THE TABLE DATA ONLY AND ONLY FOR THE FACE L1 DO NOT INCLUDE ANYTHING EXTRA.If no holes or patterns are there leave that part blank . Avoid all cases of overlaps and ensure that the cutouts are within the boundaries\n3)Response should be in json format: for holes:"+hole_json+"for patterns: "+pattern_json+"the position in all cases is {L2}"
         const imageL2 = {
         inlineData:{
             data:Buffer.from(fs.readFileSync("LL2.png")).toString("base64"),
             mimeType:"image/png",
         },
         };
         
         const result_L2 = await model.generateContent([promptL2,imageL2]);
         const  cuts_L2= result_L2.response.text();
          console.log(cuts_L2)
          if (!cuts_L1 || !cuts_L2 || !cuts_L3) {
            console.error("Error: Missing cutout data.");
            return;
        }
        


          const finalprompt = "create a sheet metal in the json format as shown"+bracketConfig +"using the following data:\n1)for sizes use this data length1:"+length1+"length2:"+length2+"width:"+width+"length3,length4 and length5 is always 100\n for L1 holes and patterns STRICTLY USE"+cuts_L1+"\n for L2 Holes and patterns use STRICTLY"+cuts_L2+"\nThe form json provides 2 rectangular options one is {Horizontal Rounded Corner Rectangle} and another is {Vertical Rounded Corner Rectangle}. If in case patterns are rectangular choose exactly one type from here and also fix length and width according to whats been provided only\n print final json only and no extra text and please NO NULL VALUES"
          const finalJSON=await model.generateContent(finalprompt)
          console.log(finalJSON.response.text())



}
async function  generate_z_bracket(usable_bracket){
    const bracketConfig = `{
        "show2d": true,
        "show3d": true,
        "bracketsType": "U Bracket",
        "dimensionType": "Inner Faces",
        "material": "Mild Steel",
        "kfactor": "0.5",
        "bracketDimensions": {
          "length1":${length1} ,
          "length2":${length2} ,
          "length3":${length3} ,
          "length4": ,
          "length5": ,
          "width": ,
          "offSetType": "Inner",
          "thickness": 2
        },
        "holes": [
          {
            "holeDiameter": ,
            "position": "",
            "Xvalue": ,
            "Zvalue": 
          }
        ],
        "patterns": [
          {
            "type": "Circular",
            "position": "",
            "numberOfPattern": 4,
            "holeSize": 5,
            "distancebetweenPattern": 10,
            "Zvalue": 20,
            "Xvalue": 0,
            "length": 10,
            "width": 20,
            "radius": 2
          }
        ]
      }`;      
    
      let dimension_table="";
      const promptb = "Context:Generate a clamp for a pipe with a height 120\n. Task:Using the below image and guidelines provide length1,length2,length3 and width for the"+usable_bracket+ "bracket\n2)Print the result in tabular form \n3)One column for the label and the other for values. Print only the table and the labels should all be in smallcase"
      const image = {
      inlineData:{
          data:Buffer.from(fs.readFileSync("Z.png")).toString("base64"),
          mimeType:"image/png",
      },
      };
      
      const resultb = await model.generateContent([promptb,image]);
       dimension_table = resultb.response.text();

      const parsedData = parseTable(dimension_table);
      if (!parsedData || typeof parsedData !== "object") {
        console.error("Error: Failed to parse AI-generated table.");
        process.exit(1);
    }
    
      console.log(dimension_table)
      

      const length1=parsedData['length1']
      const length2=parsedData['length2']
      const length3=parsedData['length3']
      const width=parsedData['width']
      
      // Log the extracted values
      console.log(`Length 1: ${length1}`);
      console.log(`Length 2: ${length2}`);
      console.log(`Length 3: ${length3}`);
      console.log(`Width: ${width}`);

      const hole_json= `"holes": [
        {
          "holeDiameter": ,
          "position": "",
          "Xvalue": ,
          "Zvalue": 
        }
      ]`

      const pattern_json=`"patterns": [
          {
            "type": "Circular",
            "position": "",
            "numberOfPattern": ,
            "holeSize": ,
            "distancebetweenPattern": ,
            "Zvalue": ,
            "Xvalue": ,
            "length": ,
            "width": ,
            "radius": 
          }
        ]`
     
        const promptf = "Context:Generate a clamp for a pipe with a height 120\n. 1)The image here shows the face profile i.e which face is L1,L2 and L3 along with a few examples of holes and patterns. These are representative examples for reference do not use the exact ones \n2)use the context to identify the need of patterns and holes on each face.\n3)print the result in tabular form where one column is the face{L1,L2 or L3},column 2 is hole or pattern. If we choose hole then one column for hole diameter but if pattern is chosen then mention number of patterns,distance between each element and shape along with radius for circular or length/width if rectangular is chosen all of which can be put in a details column.\n3)Dimensions are:Lengths:"+length1+"and"+length2 +"and"+length3+ " height is"+width
        const imagef = {
        inlineData:{
            data:Buffer.from(fs.readFileSync("Zf.png")).toString("base64"),
            mimeType:"image/png",
        },
        };
        
        const result_cuts = await model.generateContent([promptf,imagef]);
       const  cuts_table= result_cuts.response.text();
         console.log(cuts_table)


         const promptL1 = " 1)The image provided shows the profile of face L1 with the maximum length along x  being:"+length1+"and along z being"+ width+"\n2)Use the table provided:"+cuts_table+"to get the positioning of the cutouts or patterns mentioned for L1.Use the exact data from the table only and only for the case of L1. USE THE TABLE DATA ONLY AND ONLY FOR THE FACE L1 DO NOT INCLUDE ANYTHING EXTRA.If no holes or patterns are there leave that part blank . Avoid all cases of overlaps and ensure that the cutouts are within the boundaries\n3)Response should be in json format: for holes:"+hole_json+"for patterns: "+pattern_json+"the position in all cases is {L1}"
        const imageL1 = {
        inlineData:{
            data:Buffer.from(fs.readFileSync("ZL1.png")).toString("base64"),
            mimeType:"image/png",
        },
        };
        
        const result_L1 = await model.generateContent([promptL1,imageL1]);
        const  cuts_L1= result_L1.response.text();
         console.log(cuts_L1)
         const promptL2 = " 1)The image provided shows the profile of face L2 with the maximum length along x  being:"+length2+"and along z being"+ width+"\n2)Use the table provided:"+cuts_table+"to get the positioning of the cutouts or patterns mentioned for L2.Use the exact data from the table only and only for the case of L2. USE THE TABLE DATA ONLY AND ONLY FOR THE FACE L1 DO NOT INCLUDE ANYTHING EXTRA.If no holes or patterns are there leave that part blank . Avoid all cases of overlaps and ensure that the cutouts are within the boundaries\n3)Response should be in json format: for holes:"+hole_json+"for patterns: "+pattern_json+"the position in all cases is {L2}"
         const imageL2 = {
         inlineData:{
             data:Buffer.from(fs.readFileSync("ZL2.png")).toString("base64"),
             mimeType:"image/png",
         },
         };
         
         const result_L2 = await model.generateContent([promptL2,imageL2]);
         const  cuts_L2= result_L2.response.text();
          console.log(cuts_L2)
         const promptL3 = " 1)The image provided shows the profile of face L3 with the maximum length along x  being:"+length3+"and along z being"+ width+"\n2)Use the table provided:"+cuts_table+"to get the positioning of the cutouts or patterns mentioned for L3.Use the exact data from the table only and only for the case of L3. USE THE TABLE DATA ONLY AND ONLY FOR THE FACE L1 DO NOT INCLUDE ANYTHING EXTRA.If no holes or patterns are there leave that part blank . Avoid all cases of overlaps and ensure that the cutouts are within the boundaries\n3)Response should be in json format: for holes:"+hole_json+"for patterns: "+pattern_json+"the position in all cases is {L3}"
         const imageL3 = {
         inlineData:{
             data:Buffer.from(fs.readFileSync("ZL3.png")).toString("base64"),
             mimeType:"image/png",
         },
         };
         
         const result_L3 = await model.generateContent([promptL3,imageL3]);
         const  cuts_L3= result_L3.response.text();
          console.log(cuts_L3)
          if (!cuts_L1 || !cuts_L2 || !cuts_L3) {
            console.error("Error: Missing cutout data.");
            return;
        }
        
          const finalprompt = "create a sheet metal in the json format as shown"+bracketConfig +"using the following data:\n1)for sizes use this data length1:"+length1+"length2:"+length2+"length3:"+length3+"width:"+width+"length4 and length5 is always 100\n for L1 holes and patterns STRICTLY USE"+cuts_L1+"\n for L2 Holes and patterns use STRICTLY"+cuts_L2+"\n for L3 holes and patterns use STRICTLY"+cuts_L3+"\n The form json provides 2 rectangular options one is {Horizontal Rounded Corner Rectangle} and another is {Vertical Rounded Corner Rectangle}. If in case patterns are rectangular choose exactly one type from here and also fix length and width according to whats been provided only\n print final json only and no extra text and please NO NULL VALUES"
          const finalJSON=await model.generateContent(finalprompt)
          console.log(finalJSON.response.text())
}
async function  generate_offset_bracket(usable_bracket){
    const bracketConfig = `{
        "show2d": true,
        "show3d": true,
        "bracketsType": "Offset Bracket",
        "dimensionType": "Outer Faces",
        "material": "Mild Steel",
        "kfactor": "0.5",
        "bracketDimensions": {
          "length1":${length1} ,
          "length2":${length2} ,
          "length3":${length2} ,
          "length4":${length3} ,
          "length5": ${length3},
          "width": ,
          "offSetType": "Inner",
          "thickness": 2
        },
        "holes": [
          {
            "holeDiameter": ,
            "position": "",
            "Xvalue": ,
            "Zvalue": 
          }
        ],
        "patterns": [
          {
            "type": "Circular",
            "position": "",
            "numberOfPattern": 4,
            "holeSize": 5,
            "distancebetweenPattern": 10,
            "Zvalue": 20,
            "Xvalue": 0,
            "length": 10,
            "width": 20,
            "radius": 2
          }
        ]
      }`;      
    
      let dimension_table="";
      const promptb = "Context:Generate a clamp for a pipe with a height 120\n. Task:Using the below image and guidelines provide length1,length2,length3,length4,length5 and width for the"+usable_bracket+ "bracket\n2)Print the result in tabular form \n3)One column for the label and the other for values"
      const image = {
      inlineData:{
          data:Buffer.from(fs.readFileSync("Z.png")).toString("base64"),
          mimeType:"image/png",
      },
      };
      
      const resultb = await model.generateContent([promptb,image]);
       dimension_table = resultb.response.text();

      const parsedData = parseTable(dimension_table);
      if (!parsedData || typeof parsedData !== "object") {
        console.error("Error: Failed to parse AI-generated table.");
        process.exit(1);
    }
    
      

      const { 'Length 1': length1, 'Length 2': length2, 'Length 3': length3, width } = parsedData;
      
      // Log the extracted values
      console.log(`Length 1: ${length1}`);
      console.log(`Length 2: ${length2}`);
      console.log(`Length 3: ${length3}`);
      console.log(`Width: ${width}`);

      const hole_json= `"holes": [
        {
          "holeDiameter": ,
          "position": "",
          "Xvalue": ,
          "Zvalue": 
        }
      ]`

      const pattern_json=`"patterns": [
          {
            "type": "Circular",
            "position": "",
            "numberOfPattern": ,
            "holeSize": ,
            "distancebetweenPattern": ,
            "Zvalue": ,
            "Xvalue": ,
            "length": ,
            "width": ,
            "radius": 
          }
        ]`
     
        const promptf = "Context:Generate a clamp for a pipe with a height 120\n. 1)The image here shows the face profile i.e which face is L1,L2 and L3 along with a few examples of holes and patterns. These are representative examples for reference do not use the exact ones \n2)use the context to identify the need of patterns and holes on each face.\n3)print the result in tabular form where one column is the face{L1,L2 or L3},column 2 is hole or pattern. If we choose hole then one column for hole diameter but if pattern is chosen then mention number of patterns,distance between each element and shape along with radius for circular or length/width if rectangular is chosen all of which can be put in a details column.\n3)Dimensions are:Lengths:"+length1+"and"+length2 +"and"+length3+ " height is"+Width
        const imagef = {
        inlineData:{
            data:Buffer.from(fs.readFileSync("Zf.png")).toString("base64"),
            mimeType:"image/png",
        },
        };
        
        const result_cuts = await model.generateContent([promptf,imagef]);
       const  cuts_table= result_cuts.response.text();
         console.log(cuts_table)


         const promptL1 = " 1)The image provided shows the profile of face L1 with the maximum length along x  being:"+length1+"and along z being"+ Width+"\n2)Use the table provided:"+cuts_table+"to get the positioning of the cutouts or patterns mentioned for L1.Use the exact data from the table only and only for the case of L1. USE THE TABLE DATA ONLY AND ONLY FOR THE FACE L1 DO NOT INCLUDE ANYTHING EXTRA.If no holes or patterns are there leave that part blank . Avoid all cases of overlaps and ensure that the cutouts are within the boundaries\n3)Response should be in json format: for holes:"+hole_json+"for patterns: "+pattern_json+"the position in all cases is {L1}"
        const imageL1 = {
        inlineData:{
            data:Buffer.from(fs.readFileSync("ZL1.png")).toString("base64"),
            mimeType:"image/png",
        },
        };
        
        const result_L1 = await model.generateContent([promptL1,imageL1]);
        const  cuts_L1= result_L1.response.text();
         console.log(cuts_L1)
         const promptL2 = " 1)The image provided shows the profile of face L2 with the maximum length along x  being:"+length2+"and along z being"+ Width+"\n2)Use the table provided:"+cuts_table+"to get the positioning of the cutouts or patterns mentioned for L2.Use the exact data from the table only and only for the case of L2. USE THE TABLE DATA ONLY AND ONLY FOR THE FACE L1 DO NOT INCLUDE ANYTHING EXTRA.If no holes or patterns are there leave that part blank . Avoid all cases of overlaps and ensure that the cutouts are within the boundaries\n3)Response should be in json format: for holes:"+hole_json+"for patterns: "+pattern_json+"the position in all cases is {L2}"
         const imageL2 = {
         inlineData:{
             data:Buffer.from(fs.readFileSync("ZL2.png")).toString("base64"),
             mimeType:"image/png",
         },
         };
         
         const result_L2 = await model.generateContent([promptL2,imageL2]);
         const  cuts_L2= result_L2.response.text();
          console.log(cuts_L2)
         const promptL3 = " 1)The image provided shows the profile of face L3 with the maximum length along x  being:"+length3+"and along z being"+ Width+"\n2)Use the table provided:"+cuts_table+"to get the positioning of the cutouts or patterns mentioned for L3.Use the exact data from the table only and only for the case of L3. USE THE TABLE DATA ONLY AND ONLY FOR THE FACE L1 DO NOT INCLUDE ANYTHING EXTRA.If no holes or patterns are there leave that part blank . Avoid all cases of overlaps and ensure that the cutouts are within the boundaries\n3)Response should be in json format: for holes:"+hole_json+"for patterns: "+pattern_json+"the position in all cases is {L3}"
         const imageL3 = {
         inlineData:{
             data:Buffer.from(fs.readFileSync("ZL3.png")).toString("base64"),
             mimeType:"image/png",
         },
         };
         
         const result_L3 = await model.generateContent([promptL3,imageL3]);
         const  cuts_L3= result_L3.response.text();
          console.log(cuts_L3)
          if (!cuts_L1 || !cuts_L2 || !cuts_L3) {
            console.error("Error: Missing cutout data.");
            return;
        }
        
          const finalprompt = "create a sheet metal in the json format as shown"+bracketConfig +"using the following data:\n1)for sizes use this data length1:"+length1+"length2:"+length2+"length3:"+length3+"width:"+Width+"length4 and length5 is always 100\n for L1 holes and patterns STRICTLY USE"+cuts_L1+"\n for L2 Holes and patterns use STRICTLY"+cuts_L2+"\n for L3 holes and patterns use STRICTLY"+cuts_L3+"\n print final json only and no extra text"
          const finalJSON=await model.generateContent(finalprompt)
          console.log(finalJSON.response.text())
}
const usable_bracket = matches[0]?.toString().trim().toLowerCase() || "";
if (!usable_bracket) {
    console.error("Error: No valid bracket detected.");
    process.exit(1);
}
console.log(matches[0])

const validBrackets = ["u-bracket", "u bracket"];
if (validBrackets.includes(matches[0].toString().trim().toLowerCase())) {
    await generate_u_bracket(usable_bracket);
}

const validBrackets2 = ["l-bracket", "l bracket"];
if (validBrackets2.includes(matches[0].toString().trim().toLowerCase())) {
    await generate_l_bracket(usable_bracket);
}

const validBrackets3 = ["z-bracket", "z bracket"];
if (validBrackets3.includes(matches[0].toString().trim().toLowerCase())) {
    await generate_z_bracket(usable_bracket);
}

const validBrackets4 = ["offset-bracket", "offset bracket"];
if (validBrackets4.includes(matches[0].toString().trim().toLowerCase())) {
    await generate_offset_bracket(usable_bracket);
}





