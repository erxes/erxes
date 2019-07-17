---
id: coding-standards
title: Coding standards
---
## Common rules
  - We are following [https://github.com/felixge/node-style-guide](https://github.com/felixge/node-style-guide)
  - We are using [https://github.com/prettier/prettier](prettier) code formatter
  - File names must be in camel case
  ```javascript

  // right
  knowledgeBaseArticles

  // wrong
  knowledgeBase_Articles

  // wrong
  KnowldegBase_articles
  ```

## Comments

  - Use `/** ... */` for multiline comments. Include a description, specify types and values for all parameters and return values.

    ```javascript
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

    ```javascript
    // bad
    var active = true;  // is current tab

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

  - Prefixing your comments with `FIXME` or `TODO` helps other developers quickly understand if you're pointing out a problem that needs to be revisited, or if you're suggesting a solution to the problem that needs to be implemented. These are different than regular comments because they are actionable. The actions are `FIXME -- need to figure this out` or `TODO -- need to implement`.

  - Use `// FIXME:` to annotate problems

    ```javascript
    function Calculator() {

      // FIXME: shouldn't use a global here
      total = 0;

      return this;
    }
    ```

  - Use `// TODO:` to annotate solutions to problems

    ```javascript
    function Calculator() {

      // TODO: total should be configurable by an options param
      this.total = 0;

      return this;
    }
    ```

## React
  - Extension must be .js not .jsx
  - Put data fetching logics in containers folder
  - Put static representations (dumb components) in components folder
  - Put graphql queries, mutations and subscriptions in separate file

## Git workflow
  - Do not push any code with console.log or commented code
  - When you need to implement new feature, create branch from develop branch and send pull request
  - Review your code carefully before sending pull request
  - Check all javascript rules and conventions in your code before sending pull request
  - Commit regularly
  - Close your issues in comments
  #### Commit message
  - Write meaningful message
  - Pattern must be {Verb base form} {object}

  ```javascript
  // right
  Add loader to sidebar

  // wrong
  add loader to sidebar

  // wrong
  Added loader to sidebar
  ```

## Graphql
 #### Naming queries
 ```javascript
 {model name camel case}{action name}
 ```
 - List query (brands, conversations, etc...)
 - Detail query (brandDetail, conversationDetail, etc...)

 #### Naming mutations
 ```javascript
 {model name camel case}{plural}{action name}
 ```
 - Create mutation (brandsAdd, channelsAdd, etc...)
 - Update mutation (brandsEdit, channelsEdit, etc...)
 - Delete mutation (brandsRemove, channelsRemove, etc..)

 #### Requirements
 - Mutations must be easily testable. Write utils functions in associated models
 ```javascript
 class Conversation {
   static createConversation() {
    // ...
   }
 }
 ```
 - Keep mutations and queries files simple. Write utils or helper functions in associated models
 - Every mutation must have unit tests

## Testing
- We are using [https://facebook.github.io/jest/](https://facebook.github.io/jest/)
