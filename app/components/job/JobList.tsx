/**
 * JobList Component
 * Displays a list of jobs with filtering and sorting
 *
 * DEV 3 TODO:
 * 1. Implement job list rendering
 * 2. Add filtering (by state, budget range, etc.)
 * 3. Add sorting options
 * 4. Add pagination
 * 5. Add loading states
 * 6. Add empty state
 */

"use client";

import { JobCard } from "./JobCard";
import { type JobData } from "../../services";

interface JobListProps {
  jobs: JobData[];
  onJobClick?: (job: JobData) => void;
  isLoading?: boolean;
}

export function JobList({ jobs, onJobClick, isLoading }: JobListProps) {
  // TODO: Implement filtering and sorting

  if (isLoading) {
    return <div>Loading jobs...</div>;
  }

  if (jobs.length === 0) {
    return <div className="text-center py-8 text-gray-600">No jobs found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobs.map((job) => (
        <JobCard
          key={job.objectId}
          job={job}
          onClick={() => onJobClick?.(job)}
        />
      ))}
    </div>
  );
}
