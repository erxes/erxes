---
id: contributing
title: Contributing
---
## Introduction

First, thank you for considering contributing to erxes! It's people like you that make the open source community such a great community! 😊

We welcome any type of contribution, not only code. You can help with
- **QA**: file bug reports, the more details you can give the better (e.g. screenshots with the console open)
- **Marketing**: writing blog posts, howto's, printing stickers, ...
- **Community**: presenting the project at meetups, organizing a dedicated meetup for the local community, ...
- **Code**: take a look at the [open issues](issues). Even if you can't write code, commenting on them, showing that you care about a given issue matters. It helps us triage them.
- **Money**: we welcome financial contributions in full transparency on our [open collective](https://opencollective.com/erxes).

## Your First Contribution

Working on your first Pull Request? You can learn how from this *free* series, [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github).

## Submitting code

Any code change should be submitted as a pull request. The description should explain what the code does and give steps to execute it. The pull request should also contain tests.

## Commit message format

 We're using Angular convention [preset.](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/README.md)

 ### Examples

 Appears under "Features" header, inbox subheader:

 ```
feat(inbox): add 'graphiteWidth' option
```

 Appears under "Bug Fixes" header, graphite subheader, with a link to issue #28:

 ```
fix(graphite): stop graphite breaking when width < 0.1
 Closes #28
```

 Appears under "Performance Improvements" header, and under "Breaking Changes" with the breaking change explanation:

 ```
perf(inbox): remove graphiteWidth option
 BREAKING CHANGE: The graphiteWidth option has been removed. The default graphite width of 10mm is always used for performance reason.
```

 The following commit and commit `667ecc1` do not appear in the changelog if they are under the same release. If not, the revert commit appears under the "Reverts" header.

 ```
revert: feat(inbox): add 'graphiteWidth' option
 This reverts commit 667ecc1654a317a13331b17617d973392f415f02.
```

 ### Commit Message Format

 A commit message consists of a **header**, **body** and **footer**.  The header has a **type**, **scope** and **subject**:

 ```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

 The **header** is mandatory and the **scope** of the header is optional.

 ### Revert

 If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

 ### Type

 If the prefix is `feat`, `fix` or `perf`, it will appear in the changelog. However if there is any [BREAKING CHANGE](#footer), the commit will always appear in the changelog.

 Other prefixes are up to your discretion. Suggested prefixes are `build`, `ci`, `docs` ,`style`, `refactor`, and `test` for non-changelog related tasks.

 Details regarding these types can be found in the official [Angular Contributing Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#type)

 ### Scope

 The scope could be anything specifying place of the commit change. For example `$location`,
`$browser`, `$compile`, `$rootScope`, `ngHref`, `ngClick`, `ngView`, etc...

 ### Subject

 The subject contains succinct description of the change:

 * use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

 ### Body

 Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

 ### Footer

 The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

 **Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

## Code review process

The bigger the pull request, the longer it will take to review and merge. Try to break down large pull requests in smaller chunks that are easier to review and merge.
It is also always helpful to have some context for your pull request. What was the purpose? Why does it matter to you?

## Financial contributions

We also welcome financial contributions in full transparency on our [open collective](https://opencollective.com/erxes).
Anyone can file an expense. If the expense makes sense for the development of the community, it will be "merged" in the ledger of our open collective by the core contributors and the person who filed the expense will be reimbursed.

## Questions

If you have any questions, create an [issue](issue) (protip: do a quick search first to see if someone else didn't ask the same question before!).
You can also reach us at hello@erxes.opencollective.com.

## Credits

### Contributors

Thank you to all the people who have already contributed to erxes!
<a href="graphs/contributors"><img src="https://opencollective.com/erxes/contributors.svg?width=890" /></a>

### Backers

Thank you to all our backers! [[Become a backer](https://opencollective.com/erxes#backer)]

<a href="https://opencollective.com/erxes#backers" target="_blank"><img src="https://opencollective.com/erxes/backers.svg?width=890"></a>


### Sponsors

Thank you to all our sponsors! (please ask your company to also support this open source project by [becoming a sponsor](https://opencollective.com/erxes#sponsor))
