'use client'

import React from 'react';

const JobResults: React.FC<{ jobs: any[] }> = ({ jobs }) => {
  if (jobs.length === 0) {
    return <p>No jobs found.</p>;
  }

  return (
    <div>
      <h2>Job Listings</h2>
      <ul>
        {jobs.map((job, index) => (
          <li key={index} style={{ marginBottom: '15px' }}>
            <a
              href={job.jobLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 'bold', color: '#0073b1' }}
            >
              {job.jobTitle}
            </a>
            <br />
            <span>{job.companyName}</span>
            <br />
            <span>{job.location}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobResults;
