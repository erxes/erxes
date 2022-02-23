const replaceRegex = (regex, replacement) => str =>
  str.replace(regex, replacement);
// Regular expressions for Markdown (a bit strict, but they work)
const codeBlockRegex = /((\n\t)(.*))+/g;
const inlineCodeRegex = /(`)(.*?)\1/g;
const imageRegex = /!\[([^[]+)]\(([^)]+)\)/g;
const linkRegex = /\[([^[]+)\]\(([^)]+)\)/g;
const headingRegex = /\n(#+\s*)(.*)/g;
const boldItalicsRegex = /(\*{1,2})(.*?)\1/g;
const strikethroughRegex = /(~~)(.*?)\1/g;
const blockquoteRegex = /\n(&gt;|>)(.*)/g;
const horizontalRuleRegex = /\n((-{3,})|(={3,}))/g;
const unorderedListRegex = /(\n\s*(-|\+)\s.*)+/g;
const orderedListRegex = /(\n\s*([0-9]+\.)\s.*)+/g;
const paragraphRegex = /\n+(?!<pre>)(?!<h)(?!<ul>)(?!<blockquote)(?!<hr)(?!\t)([^\n]+)\n/g;
// Replacer functions for Markdown
const codeBlockReplacer = fullMatch => {
  return '\n<pre>' + fullMatch + '</pre>';
};
const inlineCodeReplacer = (fullMatch, tagStart, tagContents) => {
  return '<code>' + tagContents + '</code>';
};
const imageReplacer = (fullMatch, tagTitle, tagURL) => {
  return '<img src="' + tagURL + '" alt="' + tagTitle + '" />';
};
const linkReplacer = (fullMatch, tagTitle, tagURL) => {
  return '<a href="' + tagURL + '">' + tagTitle + '</a>';
};
const headingReplacer = (fullMatch, tagStart, tagContents) => {
  return (
    '\n<h' +
    tagStart.trim().length +
    '>' +
    tagContents +
    '</h' +
    tagStart.trim().length +
    '>'
  );
};
const boldItalicsReplacer = (fullMatch, tagStart, tagContents) => {
  return (
    '<' +
    (tagStart.trim().length === 1 ? 'em' : 'strong') +
    '>' +
    tagContents +
    '</' +
    (tagStart.trim().length === 1 ? 'em' : 'strong') +
    '>'
  );
};
const strikethroughReplacer = (fullMatch, tagStart, tagContents) =>
  '<del>' + tagContents + '</del>';
const blockquoteReplacer = (fullMatch, tagStart, tagContents) =>
  '\n<blockquote>' + tagContents + '</blockquote>';
const horizontalRuleReplacer = fullMatch => '\n<hr />';
const unorderedListReplacer = fullMatch => {
  let items = '';
  fullMatch
    .trim()
    .split('\n')
    .forEach(item => {
      items += '<li>' + item.substring(2) + '</li>';
    });
  return '\n<ul>' + items + '</ul>';
};
const orderedListReplacer = fullMatch => {
  let items = '';
  fullMatch
    .trim()
    .split('\n')
    .forEach(item => {
      items += '<li>' + item.substring(item.indexOf('.') + 2) + '</li>';
    });
  return '\n<ol>' + items + '</ol>';
};
const paragraphReplacer = (fullMatch, tagContents) =>
  '<p>' + tagContents + '</p>';
// Rules for Markdown parsing (use in order of appearance for best results)
const replaceCodeBlocks = replaceRegex(codeBlockRegex, codeBlockReplacer);
const replaceInlineCodes = replaceRegex(inlineCodeRegex, inlineCodeReplacer);
const replaceImages = replaceRegex(imageRegex, imageReplacer);
const replaceLinks = replaceRegex(linkRegex, linkReplacer);
const replaceHeadings = replaceRegex(headingRegex, headingReplacer);
const replaceBoldItalics = replaceRegex(boldItalicsRegex, boldItalicsReplacer);
const replaceceStrikethrough = replaceRegex(
  strikethroughRegex,
  strikethroughReplacer
);
const replaceBlockquotes = replaceRegex(blockquoteRegex, blockquoteReplacer);
const replaceHorizontalRules = replaceRegex(
  horizontalRuleRegex,
  horizontalRuleReplacer
);
const replaceUnorderedLists = replaceRegex(
  unorderedListRegex,
  unorderedListReplacer
);
const replaceOrderedLists = replaceRegex(orderedListRegex, orderedListReplacer);
const replaceParagraphs = replaceRegex(paragraphRegex, paragraphReplacer);
// Fix for tab-indexed code blocks
const codeBlockFixRegex = /\n(<pre>)((\n|.)*)(<\/pre>)/g;
const codeBlockFixer = (
  fullMatch,
  tagStart,
  tagContents,
  lastMatch,
  tagEnd
) => {
  let lines = '';
  tagContents.split('\n').forEach(line => {
    lines += line.substring(1) + '\n';
  });
  return tagStart + lines + tagEnd;
};
const fixCodeBlocks = replaceRegex(codeBlockFixRegex, codeBlockFixer);
// Replacement rule order function for Markdown
// Do not use as-is, prefer parseMarkdown as seen below
const replaceMarkdown = str =>
  replaceParagraphs(
    replaceOrderedLists(
      replaceUnorderedLists(
        replaceHorizontalRules(
          replaceBlockquotes(
            replaceceStrikethrough(
              replaceBoldItalics(
                replaceHeadings(
                  replaceLinks(
                    replaceImages(replaceInlineCodes(replaceCodeBlocks(str)))
                  )
                )
              )
            )
          )
        )
      )
    )
  );

// Parser for Markdown (fixes code, adds empty lines around for parsing)
// Usage: parseMarkdown(strVar)
const parseMarkdown = str =>
  fixCodeBlocks(replaceMarkdown('\n' + str + '\n')).trim();

export default parseMarkdown;
