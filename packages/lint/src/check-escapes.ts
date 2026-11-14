#!/usr/bin/env node
// Run outside oxlint: a file-level disable must not silence the check that rejects it.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { projectFiles } from './project-files.ts';

const root = process.cwd();

const escape =
  /(oxlint|eslint)-(disable|enable)|@ts-(ignore|expect-error|nocheck)|(oxfmt|prettier|biome)-ignore/;

export const checkEscapes = (excluded: string[] = []) => {
  const sources = projectFiles(root).filter(
    (file) => /\.[cm]?[jt]sx?$/.test(file) && !excluded.some((prefix) => file.startsWith(prefix)),
  );

  const problems = sources.flatMap((file) =>
    readFileSync(join(root, file), 'utf8')
      .split('\n')
      .flatMap((line, index) =>
        escape.test(line) ? [`${file}:${index + 1}: ${line.trim()}`] : [],
      ),
  );

  for (const problem of problems) process.stderr.write(`${problem}\n`);

  if (problems.length > 0) {
    process.stderr.write('check-escapes: fix the code instead of silencing a check.\n');
    process.exitCode = 1;
  }
};

if (import.meta.main) checkEscapes();
