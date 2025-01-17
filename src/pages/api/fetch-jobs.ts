import { NextApiRequest, NextApiResponse } from "next";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { jobKeyword } = req.body;

    if (!jobKeyword) {
      return res.status(400).json({ error: "No job keyword provided." });
    }

    const rapidApiKey = process.env.RAPIDAPI_KEY;
    if (!rapidApiKey) {
      return res.status(500).json({ error: "RapidAPI key is missing in environment variables." });
    }

    // Fetch jobs from LinkedIn API using the job keyword
    const jobsResponse = await fetch(
      `https://linkedin-data-api.p.rapidapi.com/search-jobs-v2?keywords=${encodeURIComponent(jobKeyword)}&locationId=92000000&datePosted=anyTime&sort=mostRelevant`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": "linkedin-data-api.p.rapidapi.com",
        },
      }
    );

    if (!jobsResponse.ok) {
      throw new Error(`Error fetching jobs: ${jobsResponse.statusText}`);
    }

    const jobsData = await jobsResponse.json();

    console.log("Jobs Data:", jobsData);

    // Check if the response contains job data
    if (jobsData?.data?.length > 0) {
      const limitedJobs = jobsData.data // Extract up to 10 jobs
      return res.status(200).json({
        jobs: limitedJobs.map((job: any) => ({
          jobTitle: job.title,
          companyName: job.company?.name || "Unknown Company",
          location: job.location || "Location not provided",
          jobLink: job.url || "No link available",
        })),
      });
    } else {
      return res.status(200).json({ message: "No jobs found based on the keyword." });
    }
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs." });
  }
}
