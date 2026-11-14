/**
 * The synthetic owner of a fresh database: the e2e setup project creates it, and
 * `vp run dev:stack up` bootstraps the same one, so the specs run on either.
 */
export const OWNER = {
  organizationName: 'E2E Org',
  firstName: 'Olivia',
  lastName: 'Owner',
  email: 'owner@e2e.test',
  password: 'E2e-owner-pass-1',
};
