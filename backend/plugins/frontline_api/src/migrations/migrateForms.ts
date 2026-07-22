import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';
import { stripHtml } from 'string-strip-html';

const { MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true' } =
  process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const STATIC_CHANNEL_ID =
  process.env.STATIC_CHANNEL_ID || 'MoxYtdjVP6arTc3jrUFZH';

const client = new MongoClient(MONGO_URL);

let db: Db;

let OLD_FORMS: Collection;
let OLD_FIELDS: Collection;
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
 * The match pattern intentionally restricts to well-formed entity shapes:
 *   - named: `&` + one-or-more ASCII letters + `;` (e.g. `&amp;`)
 *   - decimal: `&#` + one-or-more digits + `;` (e.g. `&#39;`)
 *   - hexadecimal: `&#x` + one-or-more hex digits + `;` (e.g. `&#x27;`)
 * Malformed sequences like `&#;`, `&#x;`, or `&123;` do not match and are
 * left untouched. Lookup is case-insensitive: matched text is lowercased
 * before consulting the entity map so variants like `&AMP;` or `&Quot;`
 * resolve to the same character as their canonical lowercase form.
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

  return text.replace(
    /&(?:[a-z]+|#\d+|#x[0-9a-f]+);/gi,
    (m) => entities[m.toLowerCase()] ?? m,
  );
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
  // Char class covers the full HTML5 tag-name grammar (letters, digits,
  // hyphen, underscore, period); the captured `tag` is lowercased
  // wholesale so no uppercase remnant can survive regardless of case
  // mix in the source (e.g. `<CUSTOM-TAG>` → `<custom-tag>`).
  return html.replace(
    /<(\/?)([a-zA-Z][\w.-]*)/g,
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
 * Two-pass strip-after-decode guards against entity-encoded tag bypass:
 * the first `stripHtml` pass uses `skipHtmlDecoding: true` so the
 * tokenizer leaves entities like `&lt;script&gt;` as literal text. Those
 * entities are then decoded by {@link decodeEntities}, which would
 * otherwise resurrect tag syntax (`<script>`) as plain text that could be
 * re-interpreted as HTML by a downstream renderer. A second `stripHtml`
 * pass — again with case-normalized tag names — removes any tags revealed
 * by decoding, closing the decode-after-strip bypass before whitespace
 * normalization.
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
  const decoded = decodeEntities(stripped);
  const resanitized = stripHtml(normalizeHtmlTagCase(decoded), {
    skipHtmlDecoding: true,
  }).result;
  return resanitized.replace(/\s+/g, ' ').trim();
}

const BATCH_SIZE = 1000;

const command = async () => {
  await client.connect();

  db = client.db() as Db;

  OLD_FORMS = db.collection('forms');
  OLD_FIELDS = db.collection('form_fields');
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

      const {
        _id,
        createdUserId,
        createdDate,
        name,
        title,
        code,
        type,
        description,
        numberOfPages,
        buttonText,
        tagIds,
        departmentIds,
        languageCode,
        visibility,
        status,
        integrationId,
        leadData = {},
        // brandId is intentionally omitted — dropped in new schema
      } = form;

      // Build steps map from numberOfPages
      const steps: Record<string, { name: string; description: string; order: number }> = {};
      if (numberOfPages) {
        for (let i = 1; i <= numberOfPages; i++) {
          steps[i === 1 ? 'initial' : `step-${i}`] = {
            name: `Step ${i}`,
            description: '',
            order: i,
          };
        }
      }

      const channelId = STATIC_CHANNEL_ID;

      // Explicitly map to new schema — drops brandId, merges steps into leadData
      const newDoc = {
        _id,
        createdUserId,
        createdDate,
        name,
        title,
        code,
        type,
        description,
        numberOfPages,
        buttonText,
        tagIds,
        departmentIds,
        languageCode,
        visibility,
        status: status || 'active',
        integrationId,
        channelId,
        leadData: {
          loadType: leadData.loadType,
          successAction: leadData.successAction,
          fromEmail: leadData.fromEmail,
          userEmailTitle: leadData.userEmailTitle,
          userEmailContent: leadData.userEmailContent,
          adminEmails: leadData.adminEmails,
          adminEmailTitle: leadData.adminEmailTitle,
          adminEmailContent: leadData.adminEmailContent,
          thankTitle: leadData.thankTitle,
          thankContent: leadData.thankContent,
          redirectUrl: leadData.redirectUrl,
          themeColor: leadData.themeColor,
          callout: leadData.callout,
          viewCount: leadData.viewCount ?? 0,
          contactsGathered: leadData.contactsGathered ?? 0,
          rules: leadData.rules,
          isRequireOnce: leadData.isRequireOnce,
          saveAsCustomer: leadData.saveAsCustomer,
          clearCacheAfterSave: leadData.clearCacheAfterSave,
          templateId: leadData.templateId,
          attachments: leadData.attachments,
          css: leadData.css,
          successImage: leadData.successImage,
          successImageSize: leadData.successImageSize,
          verifyEmail: leadData.verifyEmail,
          // new fields — default to undefined if not in old data
          appearance: leadData.appearance,
          thanksImage: leadData.thanksImage,
          primaryColor: leadData.primaryColor,
          steps,
        },
      };

      forms_bulk.push({
        updateOne: {
          filter: { _id },
          update: { $setOnInsert: newDoc },
          upsert: true,
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
        updateOne: {
          filter: { _id: field._id },
          update: {
            $setOnInsert: {
              ...field,
              description: htmlToText(field.description || ''),
              pageNumber: field.pageNumber || 1,
            },
          },
          upsert: true,
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
        updateOne: {
          filter: { _id: submission._id },
          update: { $setOnInsert: submission },
          upsert: true,
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
