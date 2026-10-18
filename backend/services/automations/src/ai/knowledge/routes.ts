import type { IModels } from '../../connectionResolver';
import type { IAiKnowledgeRouteDocument } from '../../mongo/aiKnowledgeRoute';

const SECTION_SEPARATOR = ' › ';
const MIN_PHRASE_CHARS = 3;
const MAX_PHRASE_CHARS = 60;
const MAX_ROUTES_PER_AGENT = 300;
const MAX_HINTS_PER_SECTION = 3;
const MAX_ROUTE_IDLE_MS = 90 * 24 * 60 * 60 * 1000;

// A phone, order or card number, or an email address: never kept, even as a
// way of asking.
const PERSONAL_DATA = /\d{4,}|@/;

// Only a short question is a reusable way of asking; a long message is one
// person's situation.
export const toAiKnowledgeRoutePhrase = (text?: string) => {
  const phrase = (text || '')
    .replace(/\[media [^\]]*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  return phrase.length >= MIN_PHRASE_CHARS &&
    phrase.length <= MAX_PHRASE_CHARS &&
    !PERSONAL_DATA.test(phrase)
    ? phrase
    : null;
};

// Written only after a reply that held up: the sections of the last search
// are what answered; any read before them that did not is a miss.
export const recordAiKnowledgeRoutes = async ({
  models,
  agentId,
  phrase,
  searches,
}: {
  models: IModels;
  agentId: string;
  phrase: string;
  searches: string[][];
}) => {
  const answered = new Set(searches.at(-1) || []);

  if (!answered.size) {
    return;
  }

  const missed = [
    ...new Set(
      searches
        .slice(0, -1)
        .flat()
        .filter((section) => !answered.has(section)),
    ),
  ];
  const now = new Date();

  await models.AiKnowledgeRoutes.bulkWrite([
    ...[...answered].map((section) => ({
      updateOne: {
        filter: { agentId, phrase, section },
        update: { $inc: { hits: 1 }, $set: { lastUsedAt: now } },
        upsert: true,
      },
    })),
    ...(missed.length
      ? [
          {
            updateMany: {
              filter: { agentId, phrase, section: { $in: missed } },
              update: { $inc: { misses: 1 } },
            },
          },
        ]
      : []),
  ]);

  // Nobody curates these, so they keep themselves honest: a path that misses
  // more than it answers, or one nobody asks any more, goes.
  await models.AiKnowledgeRoutes.deleteMany({
    agentId,
    $or: [
      { $expr: { $gt: ['$misses', '$hits'] } },
      { lastUsedAt: { $lt: new Date(now.getTime() - MAX_ROUTE_IDLE_MS) } },
    ],
  });

  const overflow = await models.AiKnowledgeRoutes.find({ agentId }, { _id: 1 })
    .sort({ hits: -1, lastUsedAt: -1 })
    .skip(MAX_ROUTES_PER_AGENT)
    .lean<Array<Pick<IAiKnowledgeRouteDocument, '_id'>>>();

  if (overflow.length) {
    await models.AiKnowledgeRoutes.deleteMany({
      _id: { $in: overflow.map(({ _id }) => _id) },
    });
  }
};

// The ways customers have asked for each top-level section, shown beside it in
// the index so a question in their words leads straight to it.
export const loadAiKnowledgeRouteHints = async ({
  models,
  agentId,
  sections,
}: {
  models: IModels;
  agentId: string;
  sections: string[];
}) => {
  const known = new Set(sections);
  const routes = await models.AiKnowledgeRoutes.find(
    { agentId, $expr: { $gt: ['$hits', '$misses'] } },
    { phrase: 1, section: 1 },
  )
    .sort({ hits: -1, lastUsedAt: -1 })
    .limit(MAX_ROUTES_PER_AGENT)
    .lean<Array<Pick<IAiKnowledgeRouteDocument, 'phrase' | 'section'>>>();
  const hintsByTop = new Map<string, string[]>();

  for (const { phrase, section } of routes) {
    // A route to a section that is gone or renamed is simply not shown.
    if (!known.has(section)) {
      continue;
    }

    const top = section.split(SECTION_SEPARATOR)[0];
    const hints = hintsByTop.get(top) || [];

    if (hints.length < MAX_HINTS_PER_SECTION && !hints.includes(phrase)) {
      hintsByTop.set(top, [...hints, phrase]);
    }
  }

  return hintsByTop;
};
