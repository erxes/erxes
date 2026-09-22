import { Document } from 'mongoose';

export interface IGithubMilestoneMapping {
  subdomain: string;
  installationId: number;
  repoName: string;
  erxesMilestoneId: string;
  githubMilestoneId: number;
  githubMilestoneNumber: number;
  githubMilestoneTitle: string;
}

export interface IGithubMilestoneMappingDocument
  extends IGithubMilestoneMapping,
    Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
