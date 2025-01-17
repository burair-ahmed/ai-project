'use client'
import { useState } from "react";

interface Job {
  jobTitle: string;
  companyName: string;
  location: string;
  jobLink: string;
}

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null); // Explicitly define the state type
  const [jobKeyword, setJobKeyword] = useState("");
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]); // Define the jobs state type
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null); // Handle file selection
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please upload a file.");
      return;
    }

    setError(""); // Clear previous errors

    // Create FormData to send the file
    const formData = new FormData();
    formData.append("resume", file);

    try {
      // Upload the resume to the API
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze the resume.");
      }

      const data = await response.json();
      setJobKeyword(data.jobKeyword); // Set the extracted job keyword
    } catch (error) {
      setError("Error uploading or analyzing the resume.");
      console.error(error);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/fetch-jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobKeyword }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch jobs.");
      }

      const data = await response.json();

      // Map the jobs data to match the Job interface
      const mappedJobs: Job[] = data.jobs.map((job: any) => ({
        jobTitle: job.jobTitle || "Unknown Title",
        companyName: job.companyName || "Unknown Company",
        location: job.location || "Unknown Location",
        jobLink: job.jobLink || "#",
      }));

      setJobs(mappedJobs); // Set the mapped jobs
    } catch (error) {
      setError("Error fetching jobs.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Upload Your Resume</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Analyze Resume</button>
      </form>

      {error && <p>{error}</p>}
      {jobKeyword && (
        <div>
          <h2>Job Keyword: {jobKeyword}</h2>
          <button onClick={fetchJobs} disabled={loading}>
            {loading ? "Loading jobs..." : "Fetch Jobs"}
          </button>
        </div>
      )}

      {jobs.length > 0 && (
        <div>
          <h2>Job Listings</h2>
          <ul>
            {jobs.map((job, index) => (
              <li key={index}>
                <a href={job.jobLink} target="_blank" rel="noopener noreferrer">
                  {job.jobTitle} at {job.companyName} ({job.location})
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
    </div>
  );
}
