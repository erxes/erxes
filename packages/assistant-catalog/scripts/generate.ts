import { writeFileSync } from 'node:fs';
import { ASSISTANT_COMPONENT_APIS, assistantCatalog } from '../src/index';

const document = assistantCatalog(ASSISTANT_COMPONENT_APIS, () => undefined).toJson();

writeFileSync(
  new URL('../catalog.json', import.meta.url),
  `${JSON.stringify(document, null, 2)}\n`,
);
