// import multer from "multer";
// import { NextApiRequest, NextApiResponse } from "next";
// import fs from "fs";
// import pdfParse from "pdf-parse";
// import dotenv from "dotenv";

// // Load environment variables from .env file
// dotenv.config();

// // Configure multer for file uploads
// const upload = multer({
//   dest: "/tmp", // Temporary storage location
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
// });

// // Middleware to handle file uploads
// const uploadMiddleware = (req: NextApiRequest, res: NextApiResponse) =>
//   new Promise((resolve, reject) => {
//     upload.single("resume")(req as any, res as any, (err: any) => {
//       if (err) return reject(err);
//       resolve(true);
//     });
//   });

// // Function to sanitize the job keyword
// const sanitizeKeyword = (keyword: string) => {
//   return keyword.replace(/[^\w\s]/g, "").trim();
// };

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method Not Allowed" });
//   }

//   try {
//     await uploadMiddleware(req, res); // Handle file upload
//     if (!req.file) return res.status(400).json({ error: "No file uploaded" });

//     // Read and extract text from PDF
//     const pdfPath = req.file.path;
//     const pdfBuffer = fs.readFileSync(pdfPath);
//     const pdfData = await pdfParse(pdfBuffer);
//     const resumeText = pdfData.text;

//     // Call OpenAI API for resume analysis (correct endpoint)
//     const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "gpt-3.5-turbo",
//         messages: [
//           {
//             role: "system",
//             content: "You are an assistant that helps with resume analysis.",
//           },
//           {
//             role: "user",
//             content: `Please analyze the resume content provided to extract key skills, job roles, relevant expertise, and any certifications or qualifications. The goal is to identify significant keywords such as programming languages, frameworks, technologies, and job titles mentioned in the resume. Prioritize extracting terms that align with common industry skills (e.g., Python, JavaScript, React) and relevant job roles (e.g., software engineer, data scientist, web developer). Based on the content of the resume, generate one primary keyword that best represents the individual’s expertise and can be used for searching relevant job opportunities. The result should be formatted as follows:
//               1. Key Skills:
//               2. Job Roles:
//               3. Primary Keyword for Job Search:
//               \n\n${resumeText}`,
//           },
//         ],
//         max_tokens: 1000,
//       }),
//     });

//     const openAiData = await openAiResponse.json();
//     console.log("OpenAI API Response:", openAiData);

//     if (openAiData.choices && openAiData.choices.length > 0) {
//       const analysisResult = openAiData.choices[0]?.message?.content || "No analysis available.";

//       // Extract job keyword from OpenAI response
//       const jobKeywords = analysisResult.trim().split("\n")[2]?.replace("Primary Keyword for Job Search:", "").trim() || "";
//       console.log("Job Keywords:", jobKeywords);

//       // Sanitize job keyword
//       const sanitizedKeyword = sanitizeKeyword(jobKeywords);

//       // Ensure RAPIDAPI_KEY is defined before making the request
//       const rapidApiKey = process.env.RAPIDAPI_KEY;
//       if (!rapidApiKey) {
//         return res.status(500).json({ error: "RapidAPI key is missing in environment variables." });
//       }

//       if (sanitizedKeyword === "") {
//         return res.status(500).json({ error: "No valid job keyword extracted from resume." });
//       }

//  // Fetch jobs from LinkedIn API using the sanitized job keyword
// const jobsResponse = await fetch(
//     `https://linkedin-data-api.p.rapidapi.com/search-jobs-v2?keywords=${encodeURIComponent(sanitizedKeyword)}&locationId=92000000&datePosted=anyTime&sort=mostRelevant`, {
//       method: 'GET',
//       headers: {
//         'x-rapidapi-key': rapidApiKey,
//         'x-rapidapi-host': 'linkedin-data-api.p.rapidapi.com',
//       },
//     }
//   );
  
//   const jobsData = await jobsResponse.json();
//   console.log("Jobs Data:", jobsData);
  
//   if (jobsData && jobsData.jobs && jobsData.jobs.length > 0) {
//     console.log("Filtered Jobs:", jobsData.jobs);  
//     const limitedJobs = jobsData.jobs.slice(0, 10);
//     res.status(200).json({
//       analysis: analysisResult,
//       jobs: jobsData.map((job: any) => ({
//         jobTitle: job.title,
//         companyName: job.company?.name || "Unknown Company",
//         location: job.location,
//         jobLink: job.url,
//       })),
//     });
//   } else {
//     console.error("No jobs found:", jobsData);
//     res.status(500).json({ error: "No jobs found based on the analysis." });
//   }
  
  
//     } else {
//       res.status(500).json({ error: "No analysis data returned from OpenAI API." });
//     }
//   } catch (error) {
//     console.error("Error during resume analysis:", error);
//     res.status(500).json({ error: "Failed to analyze resume." });
//   }
// }

// export const config = {
//   api: {
//     bodyParser: false, // Disable Next.js body parser for file uploads
//   },
// };




import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import pdfParse from "pdf-parse";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Configure multer for file uploads
const upload = multer({
  dest: "/tmp", // Temporary storage location
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// Middleware to handle file uploads
const uploadMiddleware = (req: NextApiRequest, res: NextApiResponse) =>
  new Promise((resolve, reject) => {
    upload.single("resume")(req as any, res as any, (err: any) => {
      if (err) return reject(err);
      resolve(true);
    });
  });

// Function to sanitize the job keyword
const sanitizeKeyword = (keyword: string) => {
  return keyword.replace(/[^\w\s]/g, "").trim();
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await uploadMiddleware(req, res); // Handle file upload
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Read and extract text from PDF
    const pdfPath = req.file.path;
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text;

    // Call OpenAI API for resume analysis
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an assistant that helps with resume analysis.",
          },
          {
            role: "user",
            content: `Please analyze the resume content provided to extract key skills, job roles, relevant expertise, and any certifications or qualifications. Based on the content of the resume, generate one primary keyword that best represents the individual’s expertise and can be used for searching relevant job opportunities. \n\n${resumeText}`,
          },
        ],
        max_tokens: 1000,
      }),
    });

    const openAiData = await openAiResponse.json();
    if (openAiData.choices && openAiData.choices.length > 0) {
      const analysisResult = openAiData.choices[0]?.message?.content || "No analysis available.";

      // Extract job keyword from OpenAI response
      const jobKeywords = analysisResult.trim().split("\n")[2]?.replace("Primary Keyword for Job Search:", "").trim() || "";
      const sanitizedKeyword = sanitizeKeyword(jobKeywords);

      if (sanitizedKeyword === "") {
        return res.status(500).json({ error: "No valid job keyword extracted from resume." });
      }

      // Send the extracted job keyword to the client for the next step
      res.status(200).json({ jobKeyword: sanitizedKeyword });
    } else {
      res.status(500).json({ error: "Failed to extract keyword from OpenAI response." });
    }
  } catch (error) {
    console.error("Error during resume analysis:", error);
    res.status(500).json({ error: "Failed to analyze resume." });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for file uploads
  },
};



