import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

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

function decodeEntities(text) {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };

  return text.replace(/&[a-z#0-9]+;/gi, (m) => entities[m] || m);
}

function htmlToText(html) {
  const stripped = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return decodeEntities(stripped);
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
