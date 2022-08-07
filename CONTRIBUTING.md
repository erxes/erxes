

## Contribute to erxes

Thank you for considering to contribute to erxes! This document will outline how to submit changes to this repository and which conventions to follow. If you are ever in doubt about anything, we encourage you to reach out by submitting an issue here or via <a href="https://discord.com/invite/aaGzy3gQK5" target="_blank">Discord</a>.

**Prerequisites**

- You have to be familiar with GitHub Issues and Pull Requests
- You should to read the <a href="https://www.erxes.org/overview/deployment-overview" target="_blank">docs</a>.
- You make sure you set up a test project with erxes

**Issues before PRs**

1. Before you start working on a change, please make sure there is an issue with what you will be working on. You can either find an <a href="https://github.com/erxes/erxes/issues" target="_blank">existing issue</a> or <a href="https://github.com/erxes/erxes/issues/new/choose" target="_blank">open a new issue</a> if none exists. Doing this ensures that others can contribute with thoughts or suggest alternatives, ultimately making sure that we only add changes that make the most sense to erxes future.
2. When you are ready to start working on a change, you should first <a href="https://help.github.com/en/github/getting-started-with-github/fork-a-repo" target="_blank">fork the erxes repo</a> and <a href="https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-and-deleting-branches-within-your-repository" target="_blank">branch out</a> from the develop branch.
3. Make your changes.
4. <a href="https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork" target="_blank">Open a pull request towards the development branch in the erxes repo</a>. Within a couple of days, erxes team members will review, comment, and eventually approve your PR.

## Workflow

**Branches**

All changes should be part of a branch and submitted as a pull request - your branches should be prefixed with one of:
- fix/ for bug fixes
- feat/ for features
- docs/ for documentation changes

**Commits**

Strive towards keeping your commits small and isolated - this helps the reviewer understand what is going on and makes it easier to process your requests.

**Pull Requests**

Once your changes are ready, you must submit your branch as a pull request. Your pull request should be opened against the development branch in the main erxes repo.

In your PR's description, you should follow the structure:

- What - what changes are in this PR
- Why - why are these changes relevant
- How - how have the changes been implemented
- Testing - how have the changes been tested or how can the reviewer test the feature

We highly encourage that you do a self-review prior to requesting a review. To do a self-review click the review button in the top right corner, go through your code and annotate your changes. This makes it easier for the reviewer to process your PR.

**Merge Style**

All pull requests are squashed and merged.

**Testing**

All PRs should include tests for the changes that are included. We have two types of tests that must be written:

- Unit tests found under packages/*/src/services/__tests__ and packages/*/src/api/routes/*/__tests__
- Integration tests found in integration-tests/*/__tests__

## Documentation

- We generally encourage to document your changes through comments in your code.
- If you alter user-facing behavior, you must provide documentation for such changes.
- All methods and endpoints should be documented using <a href="https://jsdoc.app/" target="_blank">JSDoc</a> and <a href="https://www.npmjs.com/package/swagger-inline" target="_blank">swagger-inline</a>.
- Afterwars, if you're contributing to our documentation about changes you made to erxes codebase make sure to also check out <a href="https://www.erxes.org/overview/deployment-overview" target="_blank">the contribution guidelines on our documentation website.</a>

## Release

The erxes team will regularly create releases from the develop branch.
