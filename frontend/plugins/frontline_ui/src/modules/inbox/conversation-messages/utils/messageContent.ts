// Linear replacement for `.replace(/<[^<>]+>/g, replacement)`. The regex form
// has super-linear backtracking on adversarial input; this scanner replaces
// exactly the same spans in one pass.
export const replaceHtmlTags = (html: string, replacement: string): string => {
  let result = '';
  let segmentStart = 0;
  let tagStart = -1;

  for (let index = 0; index < html.length; index += 1) {
    const character = html[index];

    if (character === '<') {
      if (tagStart !== -1) {
        result += html.slice(segmentStart, index);
        segmentStart = index;
      }
      tagStart = index;
    } else if (character === '>' && tagStart !== -1) {
      if (index > tagStart + 1) {
        result += html.slice(segmentStart, tagStart) + replacement;
      } else {
        result += html.slice(segmentStart, index + 1);
      }
      segmentStart = index + 1;
      tagStart = -1;
    }
  }

  return result + html.slice(segmentStart);
};
