import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const flag = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
};

const emlPath = positional[0];
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
  raw.match(/^From:[^<\n]*<([^>]+)>/im)?.[1] ??
  raw.match(/^From:\s*(\S+@\S+)/im)?.[1] ??
  'sender@example.com';

const url = new URL('/cdn-cgi/handler/email', worker);
url.searchParams.set('from', from);
url.searchParams.set('to', to);

console.log(`worker: ${url.origin}`);
console.log(`from:   ${from}`);
console.log(`to:     ${to}`);
console.log(`size:   ${(Buffer.byteLength(raw) / 1024).toFixed(1)} KB\n`);

const response = await fetch(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: raw,
});

console.log(`${response.status} ${await response.text()}`);

process.exit(response.ok ? 0 : 1);
