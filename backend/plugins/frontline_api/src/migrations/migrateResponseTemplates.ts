import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';
import { randomBytes } from 'crypto';



const { MONGO_URL = 'mongodb://localhost:27017/erxes?directConnection=true' } =
  process.env;

if (!MONGO_URL) throw new Error('Environment variable MONGO_URL not set.');

const STATIC_CHANNEL_ID = process.env.STATIC_CHANNEL_ID || 'MoxYtdjVP6arTc3jrUFZH';


const client = new MongoClient(MONGO_URL);
let db: Db;
let TEMPLATES: Collection;

const BATCH_SIZE = 1000;


function genId(): string {
  return randomBytes(15).toString('base64url').slice(0, 20);
}

/** Decode common HTML entities */
function decodeEntities(html: string): string {
  return html
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/gi,      (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

type TextStyle = {
  bold?:          true;
  italic?:        true;
  underline?:     true;
  strikethrough?: true;
};

type TextNode = { type: 'text'; text: string; styles: TextStyle };

const DEFAULT_PROPS = {
  textColor:       'default',
  backgroundColor: 'default',
  textAlignment:   'left',
};


function parseInline(html: string): TextNode[] {
  const nodes: TextNode[] = [];
  const stack: TextStyle[] = [{}];

  for (const token of html.split(/(<[^>]+>)/)) {
    if (!token) continue;

    if (token.startsWith('<')) {
      const isClose = token.startsWith('</');
      const tag     = token.toLowerCase().replace(/[<>/\s='"a-z0-9-]/g, (c) =>
        /[a-z]/.test(c) ? c : '',
      ).slice(0, 10);

      if (!isClose) {
        const next = { ...stack[stack.length - 1] };
        if (tag === 'strong' || tag === 'b')                       next.bold          = true;
        else if (tag === 'em' || tag === 'i')                       next.italic        = true;
        else if (tag === 'u')                                        next.underline     = true;
        else if (tag === 's' || tag === 'del' || tag === 'strike')  next.strikethrough = true;
        stack.push(next);
      } else {
        if (stack.length > 1) stack.pop();
      }
    } else {
      const text = decodeEntities(token);
      if (text) {
        nodes.push({ type: 'text', text, styles: { ...stack[stack.length - 1] } });
      }
    }
  }

  const merged: TextNode[] = [];
  for (const node of nodes) {
    const prev = merged[merged.length - 1];
    if (prev && JSON.stringify(prev.styles) === JSON.stringify(node.styles)) {
      prev.text += node.text;
    } else {
      merged.push({ ...node });
    }
  }

  return merged.filter((n) => n.text !== '');
}

function makeParagraph(inner: string): object {
  const content = parseInline(inner);
  return {
    id:       genId(),
    type:     'paragraph',
    props:    DEFAULT_PROPS,
    content:  content.length ? content : [{ type: 'text', text: '', styles: {} }],
    children: [],
  };
}

function htmlToBlocks(html: string): string {
  if (!html?.trim()) {
    return JSON.stringify([makeParagraph('')]);
  }

  const blocks: object[] = [];
  let remaining = html.replace(/\r\n?/g, '\n');

  while (remaining.trim()) {
    const hm = remaining.match(/^\s*<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/i);
    if (hm) {
      const level   = parseInt(hm[1][1], 10);
      const content = parseInline(hm[2]);
      if (content.length) {
        blocks.push({
          id:       genId(),
          type:     'heading',
          props:    { ...DEFAULT_PROPS, level },
          content,
          children: [],
        });
      }
      remaining = remaining.slice(hm[0].length);
      continue;
    }

    const ulm = remaining.match(/^\s*<ul[^>]*>([\s\S]*?)<\/ul>/i);
    if (ulm) {
      const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let li: RegExpExecArray | null;
      while ((li = liRe.exec(ulm[1])) !== null) {
        blocks.push({
          id:       genId(),
          type:     'bulletListItem',
          props:    DEFAULT_PROPS,
          content:  parseInline(li[1]),
          children: [],
        });
      }
      remaining = remaining.slice(ulm[0].length);
      continue;
    }

    const olm = remaining.match(/^\s*<ol[^>]*>([\s\S]*?)<\/ol>/i);
    if (olm) {
      const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let li: RegExpExecArray | null;
      while ((li = liRe.exec(olm[1])) !== null) {
        blocks.push({
          id:       genId(),
          type:     'numberedListItem',
          props:    DEFAULT_PROPS,
          content:  parseInline(li[1]),
          children: [],
        });
      }
      remaining = remaining.slice(olm[0].length);
      continue;
    }

    const pm = remaining.match(/^\s*<p[^>]*>([\s\S]*?)<\/p>/i);
    if (pm) {
      blocks.push(makeParagraph(pm[1]));
      remaining = remaining.slice(pm[0].length);
      continue;
    }

    const dm = remaining.match(/^\s*<div[^>]*>([\s\S]*?)<\/div>/i);
    if (dm) {
      const content = parseInline(dm[1]);
      if (content.some((n) => n.text.trim())) {
        blocks.push({
          id: genId(), type: 'paragraph', props: DEFAULT_PROPS, content, children: [],
        });
      }
      remaining = remaining.slice(dm[0].length);
      continue;
    }

    const brm = remaining.match(/^\s*<br\s*\/?>/i);
    if (brm) { remaining = remaining.slice(brm[0].length); continue; }

    const tagm = remaining.match(/^\s*<[^>]*>/);
    if (tagm) { remaining = remaining.slice(tagm[0].length); continue; }

    const txm = remaining.match(/^([^<]+)/);
    if (txm) {
      const text = decodeEntities(txm[1]).trim();
      if (text) {
        blocks.push({
          id:       genId(),
          type:     'paragraph',
          props:    DEFAULT_PROPS,
          content:  [{ type: 'text', text, styles: {} }],
          children: [],
        });
      }
      remaining = remaining.slice(txm[0].length);
      continue;
    }

    remaining = remaining.slice(1);
  }

  if (!blocks.length) blocks.push(makeParagraph(''));

  return JSON.stringify(blocks);
}


async function migrateResponseTemplates(): Promise<void> {
  console.log('\n🚀 Migrating response_templates → new Blocknote format');
  console.log(`   channelId : ${STATIC_CHANNEL_ID}`);

  const total = await TEMPLATES.countDocuments({ channelId: { $exists: false } });
  console.log(`📋 Pending  : ${total} document(s) without channelId`);

  if (total === 0) {
    console.log('✅ Nothing to migrate — all documents already have channelId');
    return;
  }

  const cursor = TEMPLATES
    .find({ channelId: { $exists: false } })
    .batchSize(BATCH_SIZE);

  let bulk:          any[] = [];
  let migratedCount        = 0;
  let skippedCount         = 0;

  for await (const doc of cursor) {
    if (!doc) continue;

    const isAlreadyJson = typeof doc.content === 'string' &&
      doc.content.trim().startsWith('[{');

    if (isAlreadyJson && doc.channelId) {
      skippedCount++;
      continue;
    }

    const newContent = isAlreadyJson
      ? doc.content
      : htmlToBlocks(doc.content || '');

    bulk.push({
      updateOne: {
        filter: { _id: doc._id },
        update: {
          $set: {
            content:   newContent,
            channelId: STATIC_CHANNEL_ID,
            files:     doc.files     || [],
            createdAt: doc.createdAt || new Date(),
            updatedAt: new Date(),
          },
          $unset: {
            brandId:       '',
            scopeBrandIds: '',
          },
        },
      },
    });

    migratedCount++;

    if (bulk.length >= BATCH_SIZE) {
      await TEMPLATES.bulkWrite(bulk, { ordered: false });
      console.log(`💾 Wrote batch of ${bulk.length} template(s)`);
      bulk = [];
    }
  }

  if (bulk.length) await TEMPLATES.bulkWrite(bulk, { ordered: false });

  console.log(`✅ Migrated : ${migratedCount}  |  Skipped : ${skippedCount}`);
}



const command = async () => {
  await client.connect();

  db = client.db() as Db;

  TEMPLATES = db.collection('response_templates');

  console.log('═══════════════════════════════════════════════');
  console.log('  Response templates migration');
  console.log(`  HTML content → Blocknote JSON`);
  console.log(`  channelId   : ${STATIC_CHANNEL_ID}`);
  console.log('═══════════════════════════════════════════════');

  await migrateResponseTemplates().catch((e) =>
    console.log(`❌ Migration error: ${e.message}`),
  );

  console.log('\n═══════════════════════════════════════════════');
  console.log(`  Finished at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════');

  process.exit();
};

command();
