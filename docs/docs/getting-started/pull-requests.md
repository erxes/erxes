---
id: submitting
title: How to send pull requests 
---

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