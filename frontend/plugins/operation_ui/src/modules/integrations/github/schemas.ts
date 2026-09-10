import { z } from 'zod';

export const GITHUB_TEAM_CONNECTION_SCHEMA = z.object({
  installationId: z.number().positive('Choose a GitHub organization'),
  repoName: z.string().min(1, 'Choose a GitHub repository'),
  syncMode: z.enum(['oneWay', 'twoWay']),
});

export type TGithubTeamConnectionForm = z.infer<
  typeof GITHUB_TEAM_CONNECTION_SCHEMA
>;
