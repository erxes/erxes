import { fakeModel } from '../apps/api/src/__tests__/fakeModel';
import { MODEL_KEY, MODEL_PORT, script } from './assistantModel';

export default async function globalSetup() {
  const model = await fakeModel(MODEL_KEY, MODEL_PORT);

  model.script(script);

  return () => model.close();
}
