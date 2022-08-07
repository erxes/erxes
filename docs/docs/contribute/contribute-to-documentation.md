---
id: contribute-to-documentation
title: Contribute to documentation
sidebar_label: Contribute to documentation
---

## Contribute to documentation

Thank you for your interest in contributing to the documentation! You will be helping the open source community and other developers interested in learning more about erxes and using them.

:::tip

This guide is specific to contributing to the documentation. If you’re interested in contributing to erxes codebase, check out the guideline to contribute codebase.

:::


## Site Setup

The documentation website is built with <a href="https://github.com/erxes/erxes](https://docusaurus.io/" target="_blank">Docusaurus</a>, a framework that optimizes documentation creation. If you’re not familiar with Docusaurus, it’s recommended to check out the <a href="https://github.com/erxes/erxes](https://docusaurus.io/](https://docusaurus.io/docs/installation)" target="_blank">Installation documentation</a> on their website to understand Docusaurus better, how it works, its structure, and more details.
The documentation codebase is hosted as part of the <a href="https://github.com/erxes/erxes" target="_blank">erxes repository</a> on GitHub. You’ll find the code that runs the docusaurus website under the www/docs directory.


## Documentation Content

The documentation content is written in Markdown format. If you’re not familiar with Markdown, check out this <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank">cheat sheet</a> for a quick start.
You’ll also find MDX files. MDX files combine the power of Markdown with React. So, the content of the file can contain JSX components and import statements, among other features. You can learn more about <a href="https://docusaurus.io/docs/markdown-features/react" target="_blank">MDX in docusaurus’s guide</a>.


## What You Can Contribute To

- You can contribute to the Docusaurus codebase to add a new plugin or fix a bug in the documentation website.
- You can contribute to the documentation content either by fixing errors you find or adding documentation pages.


## Style Guide

When you contribute to the documentation content, make sure to follow <a href="https://www.erxes.org/contribute/documentation-style-guide" target="_blank">the documentation style guide</a>.


## How to Contribute

If you’re fixing errors in an existing documentation page, you can scroll down to the end of the page and click on the “Edit this page” link. You’ll be redirected to the GitHub edit form of that page and you can make edits directly and submit a pull request (PR).
If you’re adding a new page or contributing to the codebase, fork the repository, create a new branch, and make all changes necessary in your repository. Then, once you’re done creating a PR in erxes repository.
For more details on how to contribute, check out the contribution guidelines on our repository.

- Branch Name
When you make edit to an existing documentation page or fork the repository to make changes to the documentation, you have to create a new branch.
Make sure that the branch name starts with docs/. For example, docs/fix-services.

- Pull Request Conventions
When you create a pull request, prefix the title with “docs:”. Make sure to keep “docs” in small letters.
In the body of the PR, explain clearly what the PR does. If the PR solves an issue, use closing keywords with the issue number. For example, “Closes #1333”.


## Sidebar

When you add a new page to the documentation, you must add the new page in www/docs/sidebars.js under the tutorialSidebar. You can learn more about the syntax used <a href="https://docusaurus.io/docs/sidebar/items" target="_blank">here</a>.

- Terminology
When the documentation page is a conceptual or overview documentation, the label in the sidebar should start with a noun.
When the documentation page is a tutorial documentation, the label in the sidebar should start with a verb. An exception of this rule are integration documentations and upgrade guides.


## Notes and Additional Information

When displaying notes and additional information in a documentation page, use Admonitions. Make sure the type of admonition used matches the note’s importance to the current document.

:::caution

If the note is something developers have to be careful of doing or not doing, use the caution or danger admonitions based on how critical it is.

:::


:::info

If the note is defining something to the developer in case they’re not familiar with it, use the info admonition.

:::

:::tip

If the note displays helpful information and tips use the tip admonition.

:::

:::note

If the admonition does not match any of the mentioned criteria, always default to the note admonition.

:::


## Need Additional Help?

If you need any additional help while contributing, you can join our <a href="https://discord.com/invite/aaGzy3gQK5" target="_blank" target="_blank">Discord</a> and ask erxes core team as well as the community any questions.

