import { fakeModel } from '../apps/api/src/__tests__/fakeModel';
import { MODEL_KEY, MODEL_PORT, script, titles } from './assistantModel';

const model = await fakeModel(MODEL_KEY, MODEL_PORT);

model.script(script);

model.titles(titles);

process.once('SIGTERM', () => void model.close().then(() => process.exit(0)));
