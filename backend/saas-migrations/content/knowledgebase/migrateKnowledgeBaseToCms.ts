import { resolve } from 'node:path';
import { config } from 'dotenv';
import { runImport } from './importKnowledgeBase';
import { readOptions } from './options';

export const migrateKnowledgeBaseToCms = async (): Promise<number> => {
  config({ path: resolve(__dirname, '../../../..', '.env') });
  const options = readOptions();
  const report = await runImport(options);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  return report.errors.length ? 1 : 0;
};

if (require.main === module) {
  migrateKnowledgeBaseToCms()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Knowledge Base migration failed.';
      process.stderr.write(
        `${message.replace(
          /mongodb(?:\+srv)?:\/\/[^\s"']+/gi,
          '[redacted MongoDB URI]',
        )}\n`,
      );
      process.exitCode = 1;
    });
}
