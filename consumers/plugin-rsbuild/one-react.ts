import { readdirSync } from 'node:fs';

// Two copies of React in node_modules means two React instances at runtime.
const copies = readdirSync('node_modules/.pnpm').filter((dir) => /^react(-dom)?@/.test(dir));

process.stdout.write(`${copies.join('\n')}\n`);

if (copies.length !== 2) throw new Error('expected one react and one react-dom');
