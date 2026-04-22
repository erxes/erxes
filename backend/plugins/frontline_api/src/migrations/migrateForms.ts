import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';
import { stripHtml } from 'string-strip-html';

const { MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true' } =
  process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let OLD_FORMS: Collection;
let OLD_FIELDS: Collection;
let OLD_CHANNELS: Collection;
let OLD_SUBMISSIONS: Collection;

let NEW_FORMS: Collection;
let NEW_FIELDS: Collection;
let NEW_SUBMISSIONS: Collection;

/**
 * Decode a small set of common HTML entities (`&amp;`, `&lt;`, `&gt;`,
 * `&quot;`, `&#39;`, `&nbsp;`) back to their literal characters.
 *
 * Unknown entities are left intact. Used as a light cleanup pass on the
 * text produced by {@link htmlToText}.
 *
 * @param text - Input string possibly containing HTML entities.
 * @returns The same string with the known entities decoded.
 */
function decodeEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };

  return text.replace(/&[a-z#0-9]+;/gi, (m) => entities[m] ?? m);
}

/**
 * Lowercase HTML tag *names* without touching attribute values or text
 * content. This is a normalizer (it renames; it does not drop anything)
 * so that downstream tokenizers can match against a lowercase-only list
 * of "dangerous" tag names (`script`, `style`, …) even when the input
 * uses uppercase or mixed-case variants like `<SCRIPT>` or `<ScRiPt>`.
 *
 * Browsers treat HTML tag names case-insensitively, but
 * `string-strip-html`'s `stripTogetherWithTheirContents` option matches
 * tag names as literal strings, so uppercase variants would otherwise
 * slip through with their bodies preserved.
 *
 * @param html - Source HTML.
 * @returns The same HTML with tag names lowercased.
 */
function normalizeHtmlTagCase(html: string): string {
  return html.replace(
    /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)/g,
    (_m, slash: string, tag: string) => `<${slash}${tag.toLowerCase()}`,
  );
}

/**
 * Convert arbitrary HTML (possibly including script/style tags with
 * attributes, trailing whitespace, or case variations) into plain text
 * for storage in the migrated `description` field.
 *
 * Uses `string-strip-html` — a proper HTML tokenizer — instead of regex,
 * which cannot reliably strip malformed or parser-forgiving tag variants
 * such as `</script foo="bar">`, `<SCRIPT>`, or `</script >`. Regex-based
 * filtering was the source of CodeQL alerts #1105, #1106, and #1107; this
 * implementation closes all three at source.
 *
 * Tag names are lowercased first so every case variant matches the
 * tokenizer's `stripTogetherWithTheirContents` list. Entity decoding in
 * the tokenizer is suppressed (`skipHtmlDecoding: true`) so
 * entity-encoded tag syntax like `&lt;script&gt;` is preserved as text
 * and decoded by {@link decodeEntities} afterward — matching the prior
 * behavior of the regex-based helper.
 *
 * `null` / `undefined` inputs are treated as an empty string so the
 * helper is total and cannot crash the migration on missing fields.
 *
 * @param html - Source HTML; `null` / `undefined` are treated as empty.
 * @returns Whitespace-collapsed, trimmed plain text.
 */
function htmlToText(html: string | null | undefined): string {
  const source = normalizeHtmlTagCase(html ?? '');
  const stripped = stripHtml(source, { skipHtmlDecoding: true }).result;
  const normalized = stripped.replace(/\s+/g, ' ').trim();
  return decodeEntities(normalized);
}

const BATCH_SIZE = 1000;

const command = async () => {
  await client.connect();

  db = client.db() as Db;

  OLD_FORMS = db.collection('forms');
  OLD_FIELDS = db.collection('form_fields');
  OLD_CHANNELS = db.collection('channels');
  OLD_SUBMISSIONS = db.collection('form_submissions');

  NEW_FORMS = db.collection('frontline_forms');
  NEW_FIELDS = db.collection('frontline_form_fields');
  NEW_SUBMISSIONS = db.collection('frontline_form_submissions');

  try {
    console.log('🚀 Started migrating forms...');

    const forms = OLD_FORMS.find({}).batchSize(BATCH_SIZE);

    let forms_bulk: any = [];

    for await (const form of forms) {
      if (!form) {
        console.log('⏭️ Skipping empty form');
        continue;
      }

      const { _id, integrationId, leadData, numberOfPages, type } = form;

      if (!integrationId) {
        console.log(
          `⏭️ No integration found for form ${JSON.stringify({
            _id,
            type,
            formId: _id,
          })}`,
        );
      }

      const channels = await OLD_CHANNELS.aggregate([
        { $match: { integrationIds: integrationId } },
        {
          $addFields: {
            arrayLength: {
              $size: { $ifNull: ['$integrationIds', []] },
            },
          },
        },
        { $sort: { arrayLength: 1 } },
        { $limit: 1 },
        { $project: { arrayLength: 0 } },
      ]).toArray();

      const steps = {};

      if (numberOfPages) {
        for (let i = 1; i <= numberOfPages; i++) {
          let key = `step-${i}`;

          if (i === 1) {
            key = 'initial';
          }

          steps[key] = {
            name: `Step ${i}`,
            description: '',
            order: i,
          };
        }
      }

      if (channels.length === 0) {
        console.log(
          `⏭️ No channel found for integration, inserted with no channel ${JSON.stringify(
            {
              integrationId,
              formId: _id,
            },
          )}`,
        );

        forms_bulk.push({
          insertOne: {
            document: {
              ...form,
              channelId: null,
              leadData: {
                ...leadData,
                steps,
              },
            },
          },
        });

        continue;
      }

      forms_bulk.push({
        insertOne: {
          document: {
            ...form,
            channelId: channels[0]._id,
            leadData: {
              ...leadData,
              steps,
            },
          },
        },
      });

      if (forms_bulk?.length >= BATCH_SIZE) {
        await NEW_FORMS.bulkWrite(forms_bulk, {
          ordered: false,
        });

        forms_bulk = [];
      }
    }

    if (forms_bulk?.length) {
      await NEW_FORMS.bulkWrite(forms_bulk, {
        ordered: false,
      });
    }

    console.log('✅ Finished migrating forms...');
  } catch (e) {
    console.log(`❌ Error occurred while migrating forms: ${e.message}`);
  }

  try {
    console.log('🚀 Started migrating form fields...');

    const fields = OLD_FIELDS.find({ contentType: 'form' }).batchSize(
      BATCH_SIZE,
    );

    let fields_bulk: any = [];

    for await (const field of fields) {
      if (!field) {
        console.log('⏭️ Skipping empty property field');
        continue;
      }

      fields_bulk.push({
        insertOne: {
          document: {
            ...field,
            description: htmlToText(field.description || ''),
            pageNumber: field.pageNumber || 1,
          },
        },
      });

      if (fields_bulk?.length >= BATCH_SIZE) {
        await NEW_FIELDS.bulkWrite(fields_bulk, {
          ordered: false,
        });

        fields_bulk = [];
      }
    }

    if (fields_bulk?.length) {
      await NEW_FIELDS.bulkWrite(fields_bulk, {
        ordered: false,
      });
    }

    console.log('✅ Finished migrating form fields...');
  } catch (e) {
    console.log(`❌ Error occurred while migrating form fields: ${e.message}`);
  }

  try {
    console.log('🚀 Started migrating form submissions...');

    const submissions = OLD_SUBMISSIONS.find({}).batchSize(BATCH_SIZE);

    let submissions_bulk: any = [];

    for await (const submission of submissions) {
      if (!submission) {
        console.log('⏭️ Skipping empty submission');
        continue;
      }

      submissions_bulk.push({
        insertOne: {
          document: submission,
        },
      });

      if (submissions_bulk?.length >= BATCH_SIZE) {
        await NEW_SUBMISSIONS.bulkWrite(submissions_bulk, {
          ordered: false,
        });

        submissions_bulk = [];
      }
    }

    if (submissions_bulk?.length) {
      await NEW_SUBMISSIONS.bulkWrite(submissions_bulk, {
        ordered: false,
      });
    }

    console.log('✅ Finished migrating form submissions...');
  } catch (e) {
    console.log(
      `❌ Error occurred while migrating form submissions: ${e.message}`,
    );
  }

  console.log(`Process finished at: ${new Date().toISOString()}`);

  process.exit();
};

command();
