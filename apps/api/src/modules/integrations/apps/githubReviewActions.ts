import { GITHUB_REVIEW_EVENTS } from '@erxes/core-db/integrationEnums';
import { z } from 'zod';
import { appAction, GatewayError, parse } from '@erxes/plugin-sdk/integrations';
import { githubSend } from './githubHooks';
import {
  Body,
  choice,
  type GithubKeys,
  LIMIT_FIELD,
  Limit,
  listed,
  listOutputs,
  loginOf,
  PULL_NUMBER,
  REPO_FIELDS,
  Repo,
  repoPath,
  User,
  Whole,
  withQuery,
  words,
} from './githubInputs';

const Review = z.object({
  id: z.int(),
  html_url: z.url(),
  state: z.string(),
  body: z.string().nullish(),
  user: User.nullish(),
  submitted_at: z.string().nullish(),
});

const REVIEW_OUTPUTS = [
  { key: 'reviewId', label: 'Review id', type: 'text', recordType: 'review' },
  { key: 'url', label: 'Review link', type: 'text' },
  { key: 'state', label: 'Review', type: 'text' },
] as const;

const reviewOutput = (review: z.output<typeof Review>) => ({
  reviewId: String(review.id),
  url: review.html_url,
  state: review.state,
});

const REVIEW_ID = {
  key: 'review',
  label: 'Review',
  type: 'plugin_record',
  recordType: 'review',
  required: true,
  description: 'The run’s review, or one an earlier "Review a pull request" step gave',
} as const;

const CreateInput = Repo.extend({
  number: Whole,
  event: z.enum(GITHUB_REVIEW_EVENTS),
  body: Body.optional(),
  commit: words(64).optional(),
});

export const reviewPullRequest = appAction<GithubKeys, z.output<typeof CreateInput>>({
  key: 'review_pull_request',
  label: 'Review a pull request',
  description: 'Approve it, ask for changes or comment on it as a whole',
  fields: [
    ...REPO_FIELDS,
    PULL_NUMBER,
    {
      ...choice('event', 'Review', GITHUB_REVIEW_EVENTS, {
        APPROVE: 'Approve',
        REQUEST_CHANGES: 'Request changes',
        COMMENT: 'Comment',
        PENDING: 'Save as a draft',
      }),
      required: true,
    },
    {
      key: 'body',
      label: 'Text',
      type: 'longtext',
      required: false,
      description: 'Needed to request changes or comment',
    },
    {
      key: 'commit',
      label: 'Commit',
      type: 'text',
      required: false,
      description: 'The commit SHA to review; blank: the latest',
    },
  ],
  outputs: [...REVIEW_OUTPUTS],
  input: CreateInput,
  async run({ client: keys, input }) {
    if (!input.body && (input.event === 'REQUEST_CHANGES' || input.event === 'COMMENT'))
      throw new GatewayError('Write the text of the review to request changes or comment', 400);

    const review = parse(
      'GitHub',
      Review,
      await githubSend(keys, 'POST', repoPath(input, `/pulls/${input.number}/reviews`), {
        event: input.event === 'PENDING' ? undefined : input.event,
        body: input.body,
        commit_id: input.commit,
      }),
      'no review',
    );

    return reviewOutput(review);
  },
});

const ReviewInput = Repo.extend({ number: Whole, review: Whole });

export const getReview = appAction<GithubKeys, z.output<typeof ReviewInput>>({
  key: 'get_review',
  label: 'Get a review',
  description: 'Read a pull request review’s verdict and text',
  fields: [...REPO_FIELDS, PULL_NUMBER, REVIEW_ID],
  outputs: [
    ...REVIEW_OUTPUTS,
    { key: 'text', label: 'Text', type: 'text' },
    { key: 'reviewer', label: 'Reviewer', type: 'text' },
    { key: 'submittedAt', label: 'Submitted at', type: 'date' },
  ],
  input: ReviewInput,
  async run({ client: keys, input }) {
    const review = parse(
      'GitHub',
      Review,
      await githubSend(
        keys,
        'GET',
        repoPath(input, `/pulls/${input.number}/reviews/${input.review}`),
      ),
      'no review',
    );

    return {
      ...reviewOutput(review),
      text: review.body ?? '',
      reviewer: loginOf(review.user),
      submittedAt: review.submitted_at ?? null,
    };
  },
});

const ListInput = Repo.extend({ number: Whole, limit: Limit });

export const listReviews = appAction<GithubKeys, z.output<typeof ListInput>>({
  key: 'list_reviews',
  label: 'List the reviews of a pull request',
  description: 'Who reviewed it and how, oldest first',
  fields: [...REPO_FIELDS, PULL_NUMBER, LIMIT_FIELD],
  outputs: listOutputs('reviews', [
    { key: 'approvals', label: 'Approvals', type: 'number' },
    { key: 'changesRequested', label: 'Change requests', type: 'number' },
  ]),
  input: ListInput,
  async run({ client: keys, input }) {
    const reviews = parse(
      'GitHub',
      z.array(Review),
      await githubSend(
        keys,
        'GET',
        withQuery(repoPath(input, `/pulls/${input.number}/reviews`), { per_page: input.limit }),
      ),
      'no reviews',
    );

    return {
      ...listed(reviews.map((review) => `${loginOf(review.user)}: ${review.state}`)),
      approvals: reviews.filter((review) => review.state === 'APPROVED').length,
      changesRequested: reviews.filter((review) => review.state === 'CHANGES_REQUESTED').length,
    };
  },
});

const UpdateInput = ReviewInput.extend({ body: words(65_000) });

export const editReview = appAction<GithubKeys, z.output<typeof UpdateInput>>({
  key: 'edit_review',
  label: 'Edit a review',
  description: 'Replace the text of a pull request review',
  fields: [
    ...REPO_FIELDS,
    PULL_NUMBER,
    REVIEW_ID,
    { key: 'body', label: 'Text', type: 'longtext', required: true },
  ],
  outputs: [...REVIEW_OUTPUTS],
  input: UpdateInput,
  async run({ client: keys, input }) {
    const review = parse(
      'GitHub',
      Review,
      await githubSend(
        keys,
        'PUT',
        repoPath(input, `/pulls/${input.number}/reviews/${input.review}`),
        { body: input.body },
      ),
      'no review',
    );

    return reviewOutput(review);
  },
});
