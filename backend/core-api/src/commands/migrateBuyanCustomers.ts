import * as dotenv from 'dotenv';

dotenv.config();

import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { parse as csvParse } from 'csv-parse';
import { AnyBulkWriteOperation, Db, MongoClient } from 'mongodb';
import { nanoid } from 'nanoid';

const {
  CORE_MONGO_URL,
  BUYAN_CSV_PATH,
  BUYAN_BATCH_SIZE,
  DRY_RUN: DRY_RUN_ENV,
  TARGET_SUBDOMAIN: TARGET_SUBDOMAIN_ENV,
} = process.env;
const TARGET_SUBDOMAIN = TARGET_SUBDOMAIN_ENV || 'ulaanbaatarbuyanmn';
if (!CORE_MONGO_URL) {
  throw new Error('Environment variable CORE_MONGO_URL not set.');
}

const CSV_PATH = BUYAN_CSV_PATH || path.join(__dirname, 'UB-buyan-new.csv');
const BATCH_SIZE = Number(BUYAN_BATCH_SIZE) || 1000;
const DRY_RUN = DRY_RUN_ENV === 'true';
const SOURCE = path.basename(CSV_PATH);
const CONTENT_TYPE = 'core:customer';

const extractDbName = (url: string): string => {
  const withoutQuery = url.split('?')[0];
  return withoutQuery.slice(withoutQuery.lastIndexOf('/') + 1);
};

const CORE_URL = CORE_MONGO_URL;

const client = new MongoClient(CORE_URL);

type CoreField = 'firstName' | 'lastName' | 'primaryPhone' | 'primaryEmail';

/** Core columns that map to native customer fields rather than properties. */
const CORE_HEADER_MAP: Record<string, CoreField> = {
  'first name': 'firstName',
  'last name': 'lastName',
  phone: 'primaryPhone',
  email: 'primaryEmail',
};

const SELECT_TYPES = new Set(['select', 'radio', 'check', 'multiSelect']);
const NUMBER_TYPES = new Set(['number']);

interface FieldMeta {
  fieldId: string;
  name: string;
  type: string;
  optionValueByLabel: Map<string, string>;
  optionValues: Set<string>;
}

interface ColumnPlan {
  index: number;
  rawHeader: string;
  field: CoreField | null;
  propertyCode: string | null;
}

const convertPropertyValue = (
  meta: FieldMeta,
  rawValue: string,
): { value: any; warning?: string } => {
  if (SELECT_TYPES.has(meta.type)) {
    const byLabel = meta.optionValueByLabel.get(rawValue.trim().toLowerCase());
    if (byLabel !== undefined) {
      return { value: byLabel };
    }
    if (meta.optionValues.has(rawValue)) {
      return { value: rawValue };
    }
    return {
      value: undefined,
      warning: `${meta.name}: unmapped option "${rawValue}"`,
    };
  }

  if (NUMBER_TYPES.has(meta.type)) {
    const num = Number(rawValue);
    if (Number.isFinite(num)) {
      return { value: num };
    }
    return {
      value: undefined,
      warning: `${meta.name}: non-numeric "${rawValue}"`,
    };
  }

  return { value: rawValue };
};

interface PreparedRow {
  lineNumber: number;
  fingerprint: string;
  doc: Record<string, any>;
  raw: Record<string, string>;
  hasName: boolean;
}

const normalize = (value: unknown): string =>
  (value === null || value === undefined ? '' : String(value)).trim();

const fingerprintRow = (cells: string[]): string =>
  createHash('sha256')
    .update(cells.map((c) => normalize(c).toLowerCase()).join(''))
    .digest('hex');

const validSearchText = (values: string[]): string => {
  const value = values.join(' ').trim();
  return value.length < 512 ? value : value.substring(0, 511);
};

const calcPSS = (doc: {
  firstName?: string;
  lastName?: string;
  code?: string;
}): { profileScore: number; searchText: string } => {
  let score = 0;
  const parts: string[] = [];

  if (doc.firstName) {
    score += 10;
    parts.push(doc.firstName);
  }
  if (doc.lastName) {
    score += 5;
    parts.push(doc.lastName);
  }
  if (doc.code) {
    score += 10;
    parts.push(doc.code);
  }

  return { profileScore: score, searchText: validSearchText(parts) };
};

interface Summary {
  totalRows: number;
  skippedDuplicateInSource: number;
  skippedEmpty: number;
  prepared: number;
  inserted: number;
  matchedExisting: number;
  modified: number;
  failed: number;
  importedWithoutName: number;
  unresolvedPropertyCodes: Set<string>;
}

const command = async () => {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV file not found at ${CSV_PATH}`);
  }

  await client.connect();

  let db: Db;
  if (TARGET_SUBDOMAIN) {
    const coreDb = client.db(extractDbName(CORE_URL));
    const targetOrg = await coreDb
      .collection('organizations')
      .findOne({ subdomain: TARGET_SUBDOMAIN }, { projection: { _id: 1 } });

    if (!targetOrg) {
      throw new Error(
        `Organization with subdomain "${TARGET_SUBDOMAIN}" not found in ${extractDbName(
          CORE_URL,
        )}.organizations`,
      );
    }

    const targetDbName = `erxes_${targetOrg._id}`;
    console.log(`Target subdomain: ${TARGET_SUBDOMAIN} -> ${targetDbName}`);
    db = client.db(targetDbName);
  } else {
    db = client.db();
    console.log(`Target database: ${db.databaseName} (from MONGO_URL)`);
  }

  const customers = db.collection('customers');

  if (!DRY_RUN) {
    await customers.createIndex(
      { 'importMeta.fingerprint': 1 },
      {
        unique: true,
        partialFilterExpression: {
          'importMeta.fingerprint': { $exists: true },
        },
        name: 'importMeta_fingerprint_unique',
      },
    );
  }

  const propertyFields = await db
    .collection('properties_fields')
    .find({ contentType: CONTENT_TYPE })
    .project({ _id: 1, code: 1, name: 1, type: 1, options: 1 })
    .toArray();

  const fieldMetaByCode = new Map<string, FieldMeta>();
  for (const field of propertyFields) {
    if (!field.code) {
      continue;
    }

    const optionValueByLabel = new Map<string, string>();
    const optionValues = new Set<string>();
    for (const opt of field.options || []) {
      if (opt && typeof opt === 'object') {
        if (opt.label != null) {
          optionValueByLabel.set(
            String(opt.label).trim().toLowerCase(),
            String(opt.value),
          );
        }
        if (opt.value != null) {
          optionValues.add(String(opt.value));
        }
      } else if (opt != null) {
        optionValueByLabel.set(String(opt).trim().toLowerCase(), String(opt));
        optionValues.add(String(opt));
      }
    }

    fieldMetaByCode.set(String(field.code), {
      fieldId: String(field._id),
      name: field.name,
      type: field.type || 'input',
      optionValueByLabel,
      optionValues,
    });
  }

  const warnedValues = new Set<string>();
  let unmappedPropertyValues = 0;

  const summary: Summary = {
    totalRows: 0,
    skippedDuplicateInSource: 0,
    skippedEmpty: 0,
    prepared: 0,
    inserted: 0,
    matchedExisting: 0,
    modified: 0,
    failed: 0,
    importedWithoutName: 0,
    unresolvedPropertyCodes: new Set(),
  };

  const reportPath = path.join(
    __dirname,
    `migrateBuyanCustomers-errors-${Date.now()}.csv`,
  );
  const reportStream = fs.createWriteStream(reportPath, { encoding: 'utf8' });
  let reportHasHeader = false;
  const writeFailure = (lineNumber: number, reason: string, raw: string[]) => {
    if (!reportHasHeader) {
      reportStream.write('lineNumber,reason,row\n');
      reportHasHeader = true;
    }
    const safe = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    reportStream.write(
      `${lineNumber},${safe(reason)},${safe(raw.join(' | '))}\n`,
    );
  };

  const seenFingerprints = new Set<string>();
  let columnPlan: ColumnPlan[] = [];
  let headerRow: string[] = [];
  let lineNumber = 0;
  let batch: PreparedRow[] = [];

  const parser = fs.createReadStream(CSV_PATH).pipe(
    csvParse({
      bom: true,
      relax_quotes: true,
      skip_empty_lines: true,
      trim: true,
    }),
  );

  const flush = async () => {
    if (batch.length === 0) {
      return;
    }

    const current = batch;
    batch = [];

    if (DRY_RUN) {
      summary.inserted += current.length;
      return;
    }

    const operations: AnyBulkWriteOperation[] = current.map((prepared) => ({
      updateOne: {
        filter: { 'importMeta.fingerprint': prepared.fingerprint },
        update: {
          $set: {
            ...prepared.doc,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            _id: nanoid(),
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    try {
      const result = await customers.bulkWrite(operations, { ordered: false });
      summary.inserted += result.upsertedCount;
      summary.matchedExisting += result.matchedCount;
      summary.modified += result.modifiedCount;
    } catch (error: any) {
      const result = error?.result || error?.writeErrors ? error : null;
      const partial = error?.result;

      if (partial) {
        summary.inserted += partial.upsertedCount || partial.nUpserted || 0;
        summary.matchedExisting +=
          partial.matchedCount || partial.nMatched || 0;
        summary.modified += partial.modifiedCount || partial.nModified || 0;
      }

      const writeErrors = error?.writeErrors || partial?.writeErrors || [];
      if (writeErrors.length) {
        for (const writeError of writeErrors) {
          const failedIndex =
            typeof writeError.index === 'number' ? writeError.index : -1;
          const prepared = current[failedIndex];
          const reason =
            writeError.errmsg || writeError.message || 'write error';
          summary.failed++;
          if (prepared) {
            console.error(`[FAILED] line ${prepared.lineNumber}: ${reason}`);
            writeFailure(
              prepared.lineNumber,
              reason,
              headerRow.map((_, i) => prepared.raw[String(i)] ?? ''),
            );
          } else {
            console.error(`[FAILED] batch op #${failedIndex}: ${reason}`);
          }
        }
      } else if (!partial) {
        summary.failed += current.length;
        for (const prepared of current) {
          console.error(
            `[FAILED] line ${prepared.lineNumber}: ${error?.message || 'batch failure'}`,
          );
          writeFailure(
            prepared.lineNumber,
            error?.message || 'batch failure',
            headerRow.map((_, i) => prepared.raw[String(i)] ?? ''),
          );
        }
      }
    }
  };

  for await (const row of parser as AsyncIterable<string[]>) {
    lineNumber++;

    if (lineNumber === 1) {
      headerRow = row;
      columnPlan = row.map((rawHeader, index) => {
        const header = normalize(rawHeader);
        const lower = header.toLowerCase();
        const field = CORE_HEADER_MAP[lower] || null;
        const codeMatch = header.match(/\[([^\]]+)\]\s*$/);
        const propertyCode = codeMatch ? codeMatch[1].trim() : null;
        return { index, rawHeader: header, field, propertyCode };
      });

      for (const plan of columnPlan) {
        if (plan.propertyCode && !fieldMetaByCode.has(plan.propertyCode)) {
          summary.unresolvedPropertyCodes.add(plan.propertyCode);
          console.warn(
            `[WARN] No customer property field for code [${plan.propertyCode}] (header "${plan.rawHeader}"). Its values will be skipped but customers will still import.`,
          );
        }
      }
      continue;
    }

    summary.totalRows++;

    const fingerprint = fingerprintRow(row);
    if (seenFingerprints.has(fingerprint)) {
      summary.skippedDuplicateInSource++;
      continue;
    }

    const raw: Record<string, string> = {};
    const doc: Record<string, any> = { state: 'customer' };
    const propertiesData: Record<string, any> = {};
    let hasAnyValue = false;

    for (const plan of columnPlan) {
      const value = normalize(row[plan.index]);
      raw[String(plan.index)] = value;
      if (!value) {
        continue;
      }
      hasAnyValue = true;

      if (plan.field) {
        doc[plan.field] = value;
      } else if (plan.propertyCode) {
        const meta = fieldMetaByCode.get(plan.propertyCode);
        if (meta) {
          const { value: converted, warning } = convertPropertyValue(
            meta,
            value,
          );
          if (converted !== undefined && converted !== '') {
            propertiesData[meta.fieldId] = converted;
          } else if (warning) {
            unmappedPropertyValues++;
            if (!warnedValues.has(warning)) {
              warnedValues.add(warning);
              console.warn(`[WARN] ${warning}`);
            }
          }
        }
      }
    }

    if (!hasAnyValue) {
      summary.skippedEmpty++;
      writeFailure(lineNumber, 'empty row', row);
      continue;
    }

    if (doc.primaryPhone) {
      doc.phones = [doc.primaryPhone];
    }
    if (doc.primaryEmail) {
      doc.emails = [doc.primaryEmail];
    }

    if (Object.keys(propertiesData).length) {
      doc.propertiesData = propertiesData;
    }

    const { profileScore, searchText } = calcPSS(doc);
    doc.profileScore = profileScore;
    doc.searchText = searchText;
    doc.importMeta = {
      source: SOURCE,
      fingerprint,
      importedAt: new Date(),

      raw,
    };

    const hasName = Boolean(doc.firstName || doc.lastName);
    if (!hasName) {
      summary.importedWithoutName++;
    }

    seenFingerprints.add(fingerprint);
    summary.prepared++;
    batch.push({ lineNumber, fingerprint, doc, raw, hasName });

    if (batch.length >= BATCH_SIZE) {
      await flush();
    }
  }

  await flush();

  await new Promise<void>((resolve) => reportStream.end(() => resolve()));
  if (!reportHasHeader) {
    // No failures — drop the empty report file.
    fs.unlinkSync(reportPath);
  }

  // -- final report -----------------------------------------------------
  console.log('\n========== UB-buyan.csv migration summary ==========');
  console.log(`Mode:                         ${DRY_RUN ? 'DRY RUN' : 'WRITE'}`);
  console.log(`Total CSV rows:               ${summary.totalRows}`);
  console.log(
    `Duplicate rows in source:     ${summary.skippedDuplicateInSource} (collapsed)`,
  );
  console.log(`Empty rows skipped:           ${summary.skippedEmpty}`);
  console.log(`Unique rows prepared:         ${summary.prepared}`);
  console.log(`Newly inserted customers:     ${summary.inserted}`);
  console.log(`Matched existing customers:   ${summary.matchedExisting}`);
  console.log(`Updated existing customers:   ${summary.modified}`);
  console.log(`Imported without a name:      ${summary.importedWithoutName}`);
  console.log(`Unmapped property values:     ${unmappedPropertyValues}`);
  console.log(`Failed rows:                  ${summary.failed}`);
  if (summary.unresolvedPropertyCodes.size) {
    console.log(
      `Unresolved property codes:    ${[...summary.unresolvedPropertyCodes].join(', ')}`,
    );
  }
  if (reportHasHeader) {
    console.log(`Failure report written to:    ${reportPath}`);
  }

  // -- verification -----------------------------------------------------
  if (!DRY_RUN) {
    const inDb = await customers.countDocuments({
      'importMeta.source': SOURCE,
    });
    console.log(`Customers in DB for source:   ${inDb}`);
    if (inDb !== summary.prepared) {
      console.warn(
        `[WARN] DB count (${inDb}) != prepared unique rows (${summary.prepared}). Investigate failed rows above.`,
      );
    } else {
      console.log(
        'Verification OK: every prepared row exists in the database.',
      );
    }
  }
  console.log('====================================================\n');

  await client.close();
  process.exit(0);
};

command().catch(async (error) => {
  console.error('Migration failed:', error);
  try {
    await client.close();
  } catch {
    // ignore close error
  }
  process.exit(1);
});
