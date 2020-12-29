---
id: contributing
title: Contributing
---

## Contributing to Erxes

We would love for you to contribute to Erxes and help make it even better than it is today! As a contributor, here are the guidelines we would like you to follow:

- [Issues and Bugs](#found-a-bug)
- [Feature Requests](#missing-a-feature)
- [Submission Guidelines](#submission-guidelines)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Swag for Contributions](#swag-for-contributions)

### Found a Bug?

If you find a bug in the source code, you can help us by [submitting an issue](#submitting-an-issue) to our [GitHub Repository](https://github.com/erxes/erxes). Even better, you can [submit a Pull Request](#submitting-a-pull-request-pr) with a fix.

### Missing a Feature?

You can request a new feature by [submitting an issue] to our GitHub Repository. If you would like to _implement_ a new feature, please submit an issue with a proposal for your work first, to be sure that we can use it. Please consider what kind of change it is:

- For a **Major Feature**, first open an issue and outline your proposal so that it can be discussed. This will also allow us to better coordinate our efforts, prevent duplication of work, and help you to craft the change so that it is successfully accepted into the project.

- **Small Features** can be crafted and directly [submitted as a Pull Request](#submitting-a-pull-request-pr).

---

## Submission Guidelines

### Submitting an Issue

Before you submit an issue, please search the issue tracker, maybe an issue for your problem already exists and the discussion might inform you of workarounds readily available.

We want to fix all the issues as soon as possible, but before fixing a bug we need to reproduce and confirm it. In order to reproduce bugs, we will systematically ask you to provide a minimal reproduction. Having a minimal reproducible scenario gives us a wealth of important information without going back & forth to you with additional questions.

A minimal reproduction allows us to quickly confirm a bug (or point out a coding problem) as well as confirm that we are fixing the right problem.

We will be insisting on a minimal reproduction scenario in order to save maintainers time and ultimately be able to fix more bugs. Interestingly, from our experience users often find coding problems themselves while preparing a minimal reproduction. We understand that sometimes it might be hard to extract essential bits of code from a larger code-base but we really need to isolate the problem before we can fix it.

Unfortunately, we are not able to investigate / fix bugs without a minimal reproduction, so if we don't hear back from you we are going to close an issue that doesn't have enough info to be reproduced.

You can file new issues by selecting from our [new issue templates](https://github.com/erxes/erxes/issues/new/choose) and filling out the issue template.

### Your First Contribution

Working on your first Pull Request? You can learn how from this _free_ series, [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github).

### Submitting a Pull Request (PR)

The bigger the pull request, the longer it will take to review and merge. Try to break down large pull requests in smaller chunks that are easier to review and merge.
It is also always helpful to have some context for your pull request. What was the purpose? Why does it matter to you?

Before you submit your Pull Request (PR) consider the following guidelines:

1. Search [GitHub](https://github.com/erxes/erxes/pulls) for an open or closed PR that relates to your submission. You don't want to duplicate effort.

1. Be sure that an issue describes the problem you're fixing, or documents the design for the feature you'd like to add. Discussing the design up front helps to ensure that we're ready to accept your work.

1. Fork the erxes/erxes repo.

1. Make your changes in a new git branch:

   _Note: Please create new branch from develop branch_

   ```sh
   git checkout -b my-fix-branch develop
   ```

1. Create your patch, **including appropriate test cases**.

1. Follow our [Coding Standards](#coding-standards).

1. Run the full erxes test suite, as described in the [developer documentation](https://www.erxes.org/), and ensure that all tests pass.

1. Commit your changes using a descriptive commit message that follows our [commit message conventions](#commit-message-format). Adherence to these conventions is necessary because release notes are automatically generated from these messages.

   ```sh
   git commit -a
   ```

   Note: the optional commit -a command line option will automatically "add" and "rm" edited files.

1. Push your branch to GitHub:

   ```sh
   git push origin my-fix-branch
   ```

1. In GitHub, send a pull request to `erxes:develop`.

- If we suggest changes then:

  - Make the required updates.
  - Re-run the erxes test suites to ensure tests are still passing.
  - Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

  ```sh
  git rebase master -i
  git push -f
  ```

That's it! Thank you for your contribution!

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes from the main (upstream) repository:

- Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

  ```sh
  git push origin --delete my-fix-branch
  ```

- Check out the develop branch:

  ```sh
  git checkout develop -f
  ```

- Delete the local branch:

  ```sh
  git branch -D my-fix-branch
  ```

- Update your develop with the latest upstream version:
  ```sh
  git pull --ff upstream develop
  ```

---

## Coding Standards

### Common rules

To ensure consistency throughout the source code, keep these rules in mind as you are working:

- All features or bug fixes **must be tested** by one or more specs (unit-tests).

- We follow https://github.com/felixge/node-style-guide.

- We use https://github.com/prettier/prettier code formatter

- File names must be in camel case

  ```js
  // right
  knowledgeBaseArticles;

  // wrong
  knowledgeBase_Articles;

  // wrong
  KnowldegBase_articles;
  ```

### Comments

- Use `/** ... */` for multiline comments. Include a description, specify types and values for all parameters and return values.

  ```js
  // bad
  // make() returns a new element
  // based on the passed in tag name
  //
  // @param {String} tag
  // @return {Element} element
  function make(tag) {
    // ...stuff...

    return element;
  }

  // good
  /**
   * make() returns a new element
   * based on the passed in tag name
   *
   * @param {String} tag
   * @return {Element} element
   */
  function make(tag) {
    // ...stuff...

    return element;
  }
  ```

- Use `//` for single line comments. Place single line comments on a newline above the subject of the comment. Put an empty line before the comment.

  ```js
  // bad
  var active = true; // is current tab

  // good
  // is current tab
  var active = true;

  // bad
  function getType() {
    console.log('fetching type...');
    // set the default type to 'no type'
    var type = this._type || 'no type';

    return type;
  }

  // good
  function getType() {
    console.log('fetching type...');

    // set the default type to 'no type'
    var type = this._type || 'no type';

    return type;
  }
  ```

* Prefixing your comments with `FIXME` or `TODO` helps other developers quickly understand if you're pointing out a problem that needs to be revisited, or if you're suggesting a solution to the problem that needs to be implemented. These are different than regular comments because they are actionable. The actions are `FIXME -- need to figure this out` or `TODO -- need to implement`.

  - Use `// FIXME`: to annotate problems

  ```js
  function Calculator() {
    // FIXME: shouldn't use a global here
    total = 0;

    return this;
  }
  ```

  - Use `// TODO`: to annotate solutions to problems

  ```js
  function Calculator() {
    // TODO: total should be configurable by an options param
    this.total = 0;

    return this;
  }
  ```

### React

- Extension must be `.js` not `.jsx`
- Put data fetching logics in containers folder
- Put static representations (dumb components) in components folder
- Put graphql queries, mutations and subscriptions in separate file

### Graphql

#### Naming queries

```sh
{model name camel case}{action name}
```

- List query (brands, conversations, etc...)
- Detail query (brandDetail, conversationDetail, etc...)

#### Naming mutations

{model name camel case}{plural}{action name}

- Create mutation (brandsAdd, channelsAdd, etc...)
- Update mutation (brandsEdit, channelsEdit, etc...)
- Delete mutation (brandsRemove, channelsRemove, etc..)

#### Requirements

- Mutations must be easily testable. Write utils functions in associated models

  ```js
  class Conversation {
    static createConversation() {
      // ...
    }
  }
  ```

- Keep mutations and queries files simple. Write utils or helper functions in associated models
- Every mutation must have unit tests

### Test

- We use https://facebook.github.io/jest

## Commit Message Guidelines

We have very precise rules over how our git commit messages can be formatted. This leads to **more readable messages** that are easy to follow when looking through the **project history**. But also, we use the git commit messages to **generate the erxes change log**.

We use Angular convention [preset.](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/README.md)

### Commit Message Format

A commit message consists of a **header**, **body** and **footer**. The header has a **type**, **scope** and **subject**:

```console
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

The footer should contain a [closing reference to an issue](https://help.github.com/articles/closing-issues-via-commit-messages/) if any.

### Revert

If the commit reverts a previous commit, it should begin with `revert:`, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **perf**: A code change that improves performance
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **test**: Adding missing tests or correcting existing tests

If the prefix is `feat`, `fix` or `perf`, it will appear in the changelog. However if there is any _**BREAKING CHANGE**_, the commit will always appear in the changelog.

### Scope

The scope could be anything specifying place of the commit change. For example `deal`, `inbox`, etc...

### Subject

The subject contains succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize first letter
- no dot (.) at the end

### Body

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

### Examples

Appears under "Features" header, inbox subheader:

```console
feat(inbox): add 'graphiteWidth' option
```

Appears under "Bug Fixes" header, graphite subheader, with a link to issue #28:

```console
fix(graphite): stop graphite breaking when width < 0.1
Closes #28
```

Appears under "Performance Improvements" header, and under "Breaking Changes" with the breaking change explanation:

```console
perf(inbox): remove graphiteWidth option
BREAKING CHANGE: The graphiteWidth option has been removed. The default graphite width of 10mm is always used for performance reason.
```

The following commit `667ecc1` do not appear in the changelog if they are under the same release. If not, the revert commit appears under the "Reverts" header.

```console
revert: feat(inbox): add 'graphiteWidth' option
This reverts commit 667ecc1654a317a13331b17617d973392f415f02.
```

## Swag for Contributions

To show our appreciation, we are sending everyone who contributes to erxes a special package, which includes a t-shirt and stickers. [Click here](https://erxes.io/hubspot-alternative-erxes-swag) to claim your swag. (Worldwide free shipping included!)

![erxes Swag](https://erxes.io/static/images/swag.gif)
