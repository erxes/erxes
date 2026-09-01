import { createHmac, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const flag = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
};

const fixture = args.find((a) => !a.startsWith('--')) ?? 'inbound';
const secret = process.env.MAIL_WEBHOOK_SECRET;
const endpoint =
  flag('endpoint') ??
  process.env.MAIL_ENDPOINT ??
  'http://localhost:3304/mail/receive';

if (!secret) {
  console.error('MAIL_WEBHOOK_SECRET is required');
  process.exit(1);
}

const path = fixture.endsWith('.json')
  ? resolve(fixture)
  : resolve(import.meta.dirname, '..', 'fixtures', `${fixture}.json`);

const payload = JSON.parse(await readFile(path, 'utf8'));

const to = flag('to');
if (to) {
  payload.to = to;
  payload.recipients = [{ address: to }];
}

const subject = flag('subject');
if (subject) {
  payload.subject = subject;
}

if (args.includes('--fresh')) {
  payload.messageId = `<${randomUUID()}@example.com>`;
}

const replyTo = flag('reply-to');
if (replyTo) {
  payload.inReplyTo = replyTo;
  payload.references = [replyTo];
}

const envelopeFrom = flag('envelope-from');
if (envelopeFrom) {
  payload.envelopeFrom = envelopeFrom;
}

const tenant =
  process.env.MAIL_TENANT?.trim() ||
  new URL(endpoint).hostname.split('.')[0];

const compact = JSON.stringify(payload);
const timestamp = Math.floor(Date.now() / 1000).toString();

const tenantSecret = createHmac('sha256', secret)
  .update(tenant, 'utf8')
  .digest('hex');

const signature = createHmac('sha256', tenantSecret)
  .update(`${timestamp}.${compact}`, 'utf8')
  .digest('hex');

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-erxes-timestamp': timestamp,
    'x-erxes-signature': signature,
  },
  body: compact,
});

const text = await response.text();

const oneLine = (value) => String(value ?? "").replace(/[\r\n]+/g, " ");

console.log(`→ ${oneLine(payload.to)}`);
console.log(`  tenant:    ${oneLine(tenant)}`);
console.log(`  messageId: ${oneLine(payload.messageId)}`);
console.log(`  ${response.status} ${oneLine(text)}`);

process.exit(response.ok ? 0 : 1);
