import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { config } from 'dotenv';
import {
  readWordPressImportOptions,
  runWordPressImport,
} from './importWordPress';

const REPOSITORY_ENV_PATH = resolve(__dirname, '../../../..', '.env');
const WORDPRESS_DATA_DIRECTORY = join(__dirname, 'data');

config({ path: REPOSITORY_ENV_PATH });

export const resolveWordPressXmlPath = (): string => {
  const xmlFiles = readdirSync(WORDPRESS_DATA_DIRECTORY, {
    withFileTypes: true,
  })
    .filter(
      (entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.xml'),
    )
    .map((entry) => entry.name)
    .sort();

  if (xmlFiles.length === 0) {
    throw new Error(
      `No WordPress XML file found in ${WORDPRESS_DATA_DIRECTORY}.`,
    );
  }

  if (xmlFiles.length > 1) {
    throw new Error(
      `Expected one WordPress XML file in ${WORDPRESS_DATA_DIRECTORY}, found: ${xmlFiles.join(
        ', ',
      )}.`,
    );
  }

  return join(WORDPRESS_DATA_DIRECTORY, xmlFiles[0]);
};

export const migrateWordPress = async (): Promise<number> => {
  const options = readWordPressImportOptions(resolveWordPressXmlPath());
  return runWordPressImport(options);
};

if (require.main === module) {
  migrateWordPress()
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.stack : String(error));
      process.exitCode = 1;
    });
}
