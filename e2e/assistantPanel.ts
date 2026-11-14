import type { Locator, Page } from '@playwright/test';
import { MODEL_KEY } from './assistantModel';
import { type coreClient, expect } from './fixtures';

export const connectFakeModel = async ({ api }: { api: ReturnType<typeof coreClient> }) => {
  await api.assistant.saveConnection({ provider: 'kimi', apiKey: MODEL_KEY });

  const { data } = await api.assistant.models();

  expect(
    data.find((entry) => entry.provider === 'kimi')?.error ?? null,
    'Start the stack with ASSISTANT_KIMI_URL=http://127.0.0.1:3510/v1 so the API talks to the fake model',
  ).toBeNull();
};

export const openAssistant = async (page: Page, path = '/') => {
  await page.goto(path);
  await page.getByRole('button', { name: 'Assistant', exact: true }).click();

  return page.getByRole('complementary', { name: 'Assistant' });
};

export const ask = async (panel: Locator, text: string) => {
  await panel.getByRole('textbox', { name: 'Message' }).fill(text);
  await panel.getByRole('textbox', { name: 'Message' }).press('Enter');
};
