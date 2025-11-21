/**
 * Job Escrow Service
 * Handles job creation, management, milestone tracking, and escrow operations
 *
 * DEV 2 TODO:
 * 1. Implement all transaction builder methods
 * 2. Add query methods for job discovery (by state, client, freelancer)
 * 3. Implement milestone parsing from job object
 * 4. Add event parsing for job creation confirmation
 * 5. Test all methods with deployed contracts
 * 6. Add comprehensive error handling
 */

import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import {
  JobData,
  JobCapData,
  JobState,
  MilestoneData,
  getJobFields,
  vectorU8ToString,
} from "./types";

export class JobService {
  private suiClient: SuiClient;
  private packageId: string;

  constructor(suiClient: SuiClient, packageId: string) {
    this.suiClient = suiClient;
    this.packageId = packageId;
  }

  // ======== Transaction Builders ========

  /**
   * Create a new job with escrow funding
   *
   * TODO: Implement
   * - Split coins if needed for exact budget amount
   * - Build moveCall with create_job target
   * - Pass title, description blob ID, budget coin, deadline, clock
   *
   * @param title Job title
   * @param descriptionBlobId Walrus blob ID for job description
   * @param budgetAmount Budget in MIST
   * @param deadline Unix timestamp in milliseconds
   * @returns Transaction to sign and execute
   */
  createJobTransaction(
    title: string,
    descriptionBlobId: string,
    budgetAmount: number,
    deadline: number
  ): Transaction {
    const tx = new Transaction();

    // TODO: Implement
    // 1. Split coins for exact budget
    // const [coin] = tx.splitCoins(tx.gas, [budgetAmount]);
    //
    // 2. Get clock object
    // tx.moveCall({
    //   arguments: [
    //     tx.pure.string(title), // or tx.pure.vector("u8", ...)
    //     tx.pure.vector("u8", Array.from(new TextEncoder().encode(descriptionBlobId))),
    //     coin,
    //     tx.pure.u64(deadline),
    //     tx.object("0x6"), // Clock object
    //   ],
    //   target: `${this.packageId}::job_escrow::create_job`,
    // });

    return tx;
  }

  /**
   * Apply for a job as freelancer
   *
   * TODO: Implement
   *
   * @param jobId Job object ID
   * @returns Transaction to sign and execute
   */
  applyForJobTransaction(jobId: string): Transaction {
    const tx = new Transaction();

    // TODO: Implement
    // tx.moveCall({
    //   arguments: [
    //     tx.object(jobId),
    //     tx.object("0x6"), // Clock
    //   ],
    //   target: `${this.packageId}::job_escrow::apply_for_job`,
    // });

    return tx;
  }

  /**
   * Assign freelancer to job (client only)
   *
   * TODO: Implement
   *
   * @param jobId Job object ID
   * @param jobCapId JobCap object ID
   * @param freelancerAddress Freelancer's address
   * @returns Transaction to sign and execute
   */
  assignFreelancerTransaction(
    jobId: string,
    jobCapId: string,
    freelancerAddress: string
  ): Transaction {
    const tx = new Transaction();

    // TODO: Implement
    // tx.moveCall({
    //   arguments: [
    //     tx.object(jobId),
    //     tx.object(jobCapId),
    //     tx.pure.address(freelancerAddress),
    //     tx.object("0x6"), // Clock
    //   ],
    //   target: `${this.packageId}::job_escrow::assign_freelancer`,
    // });

    return tx;
  }

  /**
   * Start work on job (freelancer only)
   *
   * TODO: Implement
   *
   * @param jobId Job object ID
   * @returns Transaction to sign and execute
   */
  startJobTransaction(jobId: string): Transaction {
    const tx = new Transaction();

    // TODO: Implement
    // tx.moveCall({
    //   arguments: [
    //     tx.object(jobId),
    //     tx.object("0x6"), // Clock
    //   ],
    //   target: `${this.packageId}::job_escrow::start_job`,
    // });

    return tx;
  }

  /**
   * Submit milestone completion (freelancer only)
   *
   * TODO: Implement
   *
   * @param jobId Job object ID
   * @param milestoneId Milestone number
   * @param proofBlobId Walrus blob ID for proof/deliverable
   * @returns Transaction to sign and execute
   */
  submitMilestoneTransaction(
    jobId: string,
    milestoneId: number,
    proofBlobId: string
  ): Transaction {
    const tx = new Transaction();

    // TODO: Implement
    // tx.moveCall({
    //   arguments: [
    //     tx.object(jobId),
    //     tx.pure.u64(milestoneId),
    //     tx.pure.vector("u8", Array.from(new TextEncoder().encode(proofBlobId))),
    //     tx.object("0x6"), // Clock
    //   ],
    //   target: `${this.packageId}::job_escrow::submit_milestone`,
    // });

    return tx;
  }

  /**
   * Approve milestone and release funds (client only)
   *
   * TODO: Implement
   *
   * @param jobId Job object ID
   * @param jobCapId JobCap object ID
   * @param milestoneId Milestone number
   * @returns Transaction to sign and execute
   */
  approveMilestoneTransaction(
    jobId: string,
    jobCapId: string,
    milestoneId: number
  ): Transaction {
    const tx = new Transaction();

    // TODO: Implement
    // tx.moveCall({
    //   arguments: [
    //     tx.object(jobId),
    //     tx.object(jobCapId),
    //     tx.pure.u64(milestoneId),
    //     tx.object("0x6"), // Clock
    //   ],
    //   target: `${this.packageId}::job_escrow::approve_milestone`,
    // });

    return tx;
  }

  /**
   * Add milestone to job (client only, before assignment)
   *
   * TODO: Implement
   *
   * @param jobId Job object ID
   * @param jobCapId JobCap object ID
   * @param description Milestone description
   * @param amount Amount in MIST
   * @returns Transaction to sign and execute
   */
  addMilestoneTransaction(
    jobId: string,
    jobCapId: string,
    description: string,
    amount: number
  ): Transaction {
    const tx = new Transaction();

    // TODO: Implement
    // tx.moveCall({
    //   arguments: [
    //     tx.object(jobId),
    //     tx.object(jobCapId),
    //     tx.pure.vector("u8", Array.from(new TextEncoder().encode(description))),
    //     tx.pure.u64(amount),
    //   ],
    //   target: `${this.packageId}::job_escrow::add_milestone`,
    // });

    return tx;
  }

  /**
   * Cancel job and refund (client only)
   *
   * TODO: Implement
   *
   * @param jobId Job object ID
   * @param jobCapId JobCap object ID
   * @returns Transaction to sign and execute
   */
  cancelJobTransaction(jobId: string, jobCapId: string): Transaction {
    const tx = new Transaction();

    // TODO: Implement
    // tx.moveCall({
    //   arguments: [
    //     tx.object(jobId),
    //     tx.object(jobCapId),
    //     tx.object("0x6"), // Clock
    //   ],
    //   target: `${this.packageId}::job_escrow::cancel_job`,
    // });

    return tx;
  }

  // ======== Query Methods ========

  /**
   * Get job details by ID
   *
   * TODO: Implement
   * - Fetch job object
   * - Parse fields
   * - Convert vector<u8> to strings
   * - Parse milestones from table
   *
   * @param jobId Job object ID
   * @returns Job data or null if not found
   */
  async getJob(jobId: string): Promise<JobData | null> {
    try {
      const object = await this.suiClient.getObject({
        id: jobId,
        options: { showContent: true, showOwner: true },
      });

      if (!object.data) {
        return null;
      }

      const fields = getJobFields(object.data);
      if (!fields) {
        return null;
      }

      // TODO: Parse all fields correctly
      // Convert vector<u8> to strings
      // Parse milestones table
      // Handle Option types

      return {
        objectId: jobId,
        client: fields.client,
        freelancer: fields.freelancer,
        title: vectorU8ToString(fields.title),
        descriptionBlobId: vectorU8ToString(fields.description_blob_id),
        budget: Number(fields.budget),
        state: fields.state as JobState,
        milestones: [], // TODO: Parse from fields.milestones
        milestoneCount: Number(fields.milestone_count),
        applicants: fields.applicants || [],
        createdAt: Number(fields.created_at),
        deadline: Number(fields.deadline),
        deliverableBlobIds: fields.deliverable_blob_ids.map(vectorU8ToString),
      };
    } catch (error) {
      console.error("Error fetching job:", error);
      return null;
    }
  }

  /**
   * Get all jobs posted by a client (via JobCap ownership)
   *
   * TODO: Implement
   * - Query owned objects with JobCap type filter
   * - Extract job_id from each JobCap
   * - Fetch full job data for each
   *
   * @param clientAddress Client's address
   * @returns Array of job data
   */
  async getJobsByClient(clientAddress: string): Promise<JobData[]> {
    try {
      // TODO: Implement
      // const objects = await this.suiClient.getOwnedObjects({
      //   owner: clientAddress,
      //   options: { showContent: true, showType: true },
      //   filter: { StructType: `${this.packageId}::job_escrow::JobCap` },
      // });

      // const jobs: JobData[] = [];
      // for (const obj of objects.data) {
      //   if (obj.data?.content?.dataType === "moveObject") {
      //     const fields = obj.data.content.fields as any;
      //     const jobId = fields.job_id;
      //     const job = await this.getJob(jobId);
      //     if (job) jobs.push(job);
      //   }
      // }

      return [];
    } catch (error) {
      console.error("Error fetching client jobs:", error);
      return [];
    }
  }

  /**
   * Get all jobs assigned to a freelancer
   *
   * TODO: Implement
   * - Use dynamic field queries or event indexing
   * - Filter jobs where freelancer field matches address
   *
   * @param freelancerAddress Freelancer's address
   * @returns Array of job data
   */
  async getJobsByFreelancer(freelancerAddress: string): Promise<JobData[]> {
    try {
      // TODO: Implement
      // This requires querying all Job objects and filtering
      // or using an indexer/event-based approach

      return [];
    } catch (error) {
      console.error("Error fetching freelancer jobs:", error);
      return [];
    }
  }

  /**
   * Get all open jobs (for marketplace)
   *
   * TODO: Implement
   * - Query events or use indexer
   * - Filter by state = OPEN
   *
   * @returns Array of open jobs
   */
  async getOpenJobs(): Promise<JobData[]> {
    try {
      // TODO: Implement
      // This requires event-based indexing or full scan
      // Consider using MoveEventQuery for JobCreated events

      return [];
    } catch (error) {
      console.error("Error fetching open jobs:", error);
      return [];
    }
  }

  /**
   * Get JobCap details
   *
   * TODO: Implement
   *
   * @param capId JobCap object ID
   * @returns JobCap data or null
   */
  async getJobCap(capId: string): Promise<JobCapData | null> {
    try {
      const object = await this.suiClient.getObject({
        id: capId,
        options: { showContent: true },
      });

      if (
        !object.data ||
        object.data.content?.dataType !== "moveObject"
      ) {
        return null;
      }

      const fields = object.data.content.fields as any;
      return {
        objectId: capId,
        jobId: fields.job_id,
      };
    } catch (error) {
      console.error("Error fetching JobCap:", error);
      return null;
    }
  }

  /**
   * Get all JobCaps owned by address
   *
   * TODO: Implement
   *
   * @param ownerAddress Owner's address
   * @returns Array of JobCap data
   */
  async getJobCapsByOwner(ownerAddress: string): Promise<JobCapData[]> {
    try {
      const objects = await this.suiClient.getOwnedObjects({
        owner: ownerAddress,
        options: { showContent: true, showType: true },
        filter: { StructType: `${this.packageId}::job_escrow::JobCap` },
      });

      const caps: JobCapData[] = [];
      for (const obj of objects.data) {
        if (obj.data?.content?.dataType === "moveObject") {
          const fields = obj.data.content.fields as any;
          caps.push({
            objectId: obj.data.objectId,
            jobId: fields.job_id,
          });
        }
      }

      return caps;
    } catch (error) {
      console.error("Error fetching JobCaps:", error);
      return [];
    }
  }

  // ======== Helper Methods ========

  /**
   * Wait for transaction and extract created Job and JobCap IDs
   *
   * TODO: Implement
   * - Wait for transaction confirmation
   * - Parse effects to find created objects
   * - Identify Job and JobCap by type
   *
   * @param digest Transaction digest
   * @returns Object with jobId and jobCapId
   */
  async waitForTransactionAndGetCreatedObjects(
    digest: string
  ): Promise<{ jobId: string; jobCapId: string } | null> {
    try {
      const result = await this.suiClient.waitForTransaction({
        digest,
        options: { showEffects: true, showObjectChanges: true },
      });

      // TODO: Parse objectChanges to find Job and JobCap
      // const jobObject = result.objectChanges?.find(
      //   (change) =>
      //     change.type === "created" &&
      //     change.objectType.includes("::job_escrow::Job")
      // );

      // const capObject = result.objectChanges?.find(
      //   (change) =>
      //     change.type === "created" &&
      //     change.objectType.includes("::job_escrow::JobCap")
      // );

      return null;
    } catch (error) {
      console.error("Error waiting for transaction:", error);
      return null;
    }
  }

  /**
   * Wait for transaction completion
   *
   * @param digest Transaction digest
   */
  async waitForTransaction(digest: string): Promise<void> {
    await this.suiClient.waitForTransaction({ digest });
  }

  /**
   * Get job state as human-readable string
   *
   * @param state Job state enum value
   * @returns State name
   */
  getJobStateName(state: JobState): string {
    return JobState[state] || "UNKNOWN";
  }
}

/**
 * Factory function to create JobService instance
 *
 * @param suiClient Sui client instance
 * @param packageId Job escrow package ID
 * @returns JobService instance
 */
export function createJobService(
  suiClient: SuiClient,
  packageId: string
): JobService {
  return new JobService(suiClient, packageId);
}
