import { createFile, deleteFile, getFile, listFiles, updateFile } from './githubFileActions';
import {
  addComment,
  createIssue,
  editComment,
  editIssue,
  getIssue,
  lockIssue,
} from './githubIssueActions';
import { listIssues, listMyIssues, listPullRequests } from './githubListActions';
import {
  inviteUser,
  listOrgMembers,
  listOrgRepositories,
  listUserRepositories,
} from './githubOrgActions';
import {
  closePullRequest,
  createPullRequest,
  editPullRequest,
  getPullRequest,
  mergePullRequest,
  reopenPullRequest,
} from './githubPullActions';
import {
  createRelease,
  deleteRelease,
  getRelease,
  listReleases,
  updateRelease,
} from './githubReleaseActions';
import {
  getCommunityProfile,
  getLicense,
  getRepository,
  listPopularPaths,
  listReferrers,
} from './githubRepoActions';
import { editReview, getReview, listReviews, reviewPullRequest } from './githubReviewActions';
import {
  disableWorkflow,
  enableWorkflow,
  getWorkflow,
  listWorkflows,
  runWorkflow,
} from './githubWorkflowActions';

export const GITHUB_ACTIONS = [
  createIssue,
  editIssue,
  getIssue,
  lockIssue,
  addComment,
  editComment,
  listIssues,
  listMyIssues,
  createPullRequest,
  editPullRequest,
  closePullRequest,
  reopenPullRequest,
  getPullRequest,
  mergePullRequest,
  listPullRequests,
  reviewPullRequest,
  getReview,
  editReview,
  listReviews,
  createRelease,
  getRelease,
  updateRelease,
  deleteRelease,
  listReleases,
  createFile,
  updateFile,
  deleteFile,
  getFile,
  listFiles,
  runWorkflow,
  enableWorkflow,
  disableWorkflow,
  getWorkflow,
  listWorkflows,
  getRepository,
  getLicense,
  getCommunityProfile,
  listPopularPaths,
  listReferrers,
  listOrgRepositories,
  listOrgMembers,
  listUserRepositories,
  inviteUser,
];
