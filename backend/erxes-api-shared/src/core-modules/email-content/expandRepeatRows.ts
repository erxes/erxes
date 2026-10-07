/** A table row: cells never hold another table in what the editors write. */
const ROW = /<tr\b[^>]*>[\s\S]*?<\/tr>/gi;

/** `{{ list.$.field }}`: one field of each item in `list`. */
const ITEM_PLACEHOLDER = /\{\{\s*([^{}|]+?)\.\$\.[^{}]*?\}\}/;

/** How many items a list holds, asked as `list.$count`. */
export type TRepeatCounter = (listPath: string) => Promise<number>;

const itemsOf = async (
  listPath: string,
  countOf: TRepeatCounter,
  counts: Map<string, number>,
) => {
  if (!counts.has(listPath)) {
    counts.set(listPath, Math.max(0, Math.floor((await countOf(listPath)) || 0)));
  }

  return counts.get(listPath) || 0;
};

/**
 * A row whose cells read `{{ list.$.field }}` is written once per item of the
 * list, `$` becoming the item's index, so the usual placeholder pass fills
 * each copy from its own item. An empty list leaves no row.
 */
export const expandRepeatRows = async (
  html: string | undefined,
  countOf: TRepeatCounter,
): Promise<string> => {
  if (!html || !html.includes('.$.')) {
    return html || '';
  }

  const counts = new Map<string, number>();
  const rows = [...html.matchAll(ROW)];
  let expanded = '';
  let cursor = 0;

  for (const match of rows) {
    const row = match[0];
    const listPath = row.match(ITEM_PLACEHOLDER)?.[1]?.trim();

    if (!listPath) {
      continue;
    }

    const count = await itemsOf(listPath, countOf, counts);
    const marker = `${listPath}.$.`;

    expanded += html.slice(cursor, match.index);
    expanded += Array.from({ length: count }, (_, index) =>
      row.split(marker).join(`${listPath}.${index}.`),
    ).join('');
    cursor = (match.index || 0) + row.length;
  }

  return expanded + html.slice(cursor);
};
