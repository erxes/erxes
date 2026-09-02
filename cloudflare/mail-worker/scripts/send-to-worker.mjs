import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ANGLE_FROM = /^From:[^<\n]*<([^>]+)>/im;
const PLAIN_FROM = /^From:\s*(\S+@\S+)/im;

const args = process.argv.slice(2);
const flag = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
};

const emlPath = args.find((a) => !a.startsWith('--'));
const to = flag('to');
const worker = flag('worker') ?? 'http://localhost:8787';

if (!emlPath || !to) {
  console.error(
    'usage: node scripts/send-to-worker.mjs <file.eml> --to=<address> [--worker=http://localhost:8787]',
  );
  process.exit(1);
}

const raw = await readFile(resolve(emlPath), 'utf8');

const from =
  ANGLE_FROM.exec(raw)?.[1] ??
  PLAIN_FROM.exec(raw)?.[1] ??
  'sender@example.com';

const oneLine = (value) => String(value ?? '').replace(/[\r\n]+/g, ' ');

const url = new URL('/cdn-cgi/handler/email', worker);
url.searchParams.set('from', from);
url.searchParams.set('to', to);

console.log(`worker: ${url.origin}`);
console.log(`from:   ${oneLine(from)}`);
console.log(`to:     ${oneLine(to)}`);
console.log(`size:   ${(Buffer.byteLength(raw) / 1024).toFixed(1)} KB\n`);

const response = await fetch(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: raw,
});

const text = await response.text();

console.log(`${response.status} ${oneLine(text)}`);

process.exit(response.ok ? 0 : 1);
