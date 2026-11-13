import type { IModels } from '~/connectionResolvers';
import { loadAgentsSettingsClass } from '@/agents/db/models/Settings';

it('concurrent first reads share one indexed settings identity', async () => {
  const stored = new Map<string, { _id: string; approvalMode: string }>();
  const model = {
    findOne: () => ({ lean: async () => [...stored.values()][0] ?? null }),
    findOneAndUpdate: jest.fn((filter: { _id: string }) => {
      if (!stored.has(filter._id)) stored.set(filter._id, { _id: filter._id, approvalMode: 'writes' });
      return { lean: async () => stored.get(filter._id) };
    }),
  };
  const schema = loadAgentsSettingsClass({ AgentsSettings: model } as unknown as IModels);
  const getSettings = schema.statics.getSettings as () => Promise<{ _id: string }>;
  const [a, b] = await Promise.all([getSettings(), getSettings()]);
  expect(a._id).toBe(b._id);
  expect(stored.size).toBe(1);
});

it('keeps an existing tenant settings document and its saved policy', async () => {
  const existing = { _id: 'legacy', approvalMode: 'destructive' };
  const create = jest.fn();
  const schema = loadAgentsSettingsClass({ AgentsSettings: {
    findOne: () => ({ lean: async () => existing }), findOneAndUpdate: create,
  } } as unknown as IModels);
  const getSettings = schema.statics.getSettings as () => Promise<typeof existing>;
  expect(await getSettings()).toBe(existing);
  expect(create).not.toHaveBeenCalled();
});
