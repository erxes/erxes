// The flows measure.ts times, each on a page whose context has the UI as its baseURL.
import type { Page } from 'playwright-core';
import type { Sample } from './probes';

export const median = (values: number[]) =>
  values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)] ?? 0;

const summarize = (samples: Sample[]) => ({
  n: samples.length,
  ms: +median(samples.map((s) => s.ms)).toFixed(1),
  renders: median(samples.map((s) => s.renders)),
});

export const settle = async (page: Page) => {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
};

const openCustomers = async (page: Page) => {
  await page.goto(`/contacts/customers`);
  await page.locator('tbody [role=checkbox]').first().waitFor();
  await settle(page);
};

/** Selecting rows and hiding a column: state that lives in the record table. */
export const contactsTable = async (page: Page) => {
  await openCustomers(page);

  const rowCheckbox = await page.evaluate(() =>
    window.perf.repeat(20, (i) => {
      document.querySelectorAll<HTMLElement>('tbody [role=checkbox]')[i % 10]?.click();
    }),
  );

  const selectAll = await page.evaluate(() =>
    window.perf.repeat(10, () => {
      document.querySelector<HTMLElement>('[aria-label="Select all rows"]')?.click();
    }),
  );

  // The list has no sort control, so a column's visibility stands in for header state.
  await page.locator('thead button').first().click();
  await page.getByRole('menu').waitFor();

  const columnToggle = await page.evaluate(() =>
    window.perf.repeat(10, () => {
      document
        .querySelectorAll<HTMLElement>('[role=menu] [role=checkbox]:not([disabled])')[1]
        ?.click();
    }),
  );

  await page.keyboard.press('Escape');

  return {
    'contacts: row checkbox': summarize(rowCheckbox),
    'contacts: select all': summarize(selectAll),
    'contacts: toggle a column': summarize(columnToggle),
  };
};

/** The search filter and the side panel: work outside the table that re-renders it. */
export const contactsSearchAndPanel = async (page: Page) => {
  await openCustomers(page);
  await page.getByRole('button', { name: 'Filter' }).click();
  await page.getByRole('option', { name: 'Search' }).click();
  await page.getByPlaceholder('Enter search text').waitFor();

  // A keystroke's own cost, before any request.
  const typing = await page.evaluate(() =>
    window.perf.repeat(12, (i) => {
      const input = document.activeElement;

      if (input instanceof HTMLInputElement) window.perf.type(input, 'Alice Carter'.charAt(i));
    }),
  );

  // Applying it, until only matching rows are on screen.
  const apply = await page.evaluate(() =>
    window.perf.time(async () => {
      const input = document.activeElement;

      if (input instanceof HTMLInputElement) input.form?.requestSubmit();

      await window.perf.until(() =>
        [...document.querySelectorAll('tbody tr')].every(
          (row) => !row.textContent?.trim() || row.textContent.includes('Alice'),
        ),
      );
    }),
  );

  // Opening a customer in the side panel until its name shows, then closing it.
  await openCustomers(page);

  const sidePanel: Sample[] = [];

  for (let row = 0; row < 8; row++) {
    sidePanel.push(
      await page.evaluate(
        (index) =>
          window.perf.time(async () => {
            const anchor = document.querySelectorAll<HTMLElement>(
              'tbody td:nth-child(4) button > *',
            )[index];

            const name = anchor?.textContent?.trim() ?? '';

            anchor?.click();
            await window.perf.until(
              () =>
                document.querySelector('[data-record-side-panel]')?.textContent?.includes(name) ??
                false,
            );
          }),
        row,
      ),
    );

    const panel = page.locator('[data-record-side-panel]');

    await panel.getByRole('button', { name: 'Close' }).click();
    await panel.waitFor({ state: 'detached' });
  }

  return {
    'contacts: type in search': summarize(typing),
    'contacts: apply search': summarize([apply]),
    'contacts: open side panel': summarize(sidePanel),
  };
};

export const board = async (page: Page) => {
  await page.evaluate(() => localStorage.setItem('erxes_leads_view', JSON.stringify('board')));
  await page.goto(`/contacts/leads`);
  await page.locator('[aria-roledescription=draggable]').first().waitFor();
  await settle(page);

  // Drags the first card across the board and back, one pointer move a frame, and drops it
  // where it started, so the run changes no data.
  const moves = await page.evaluate(async () => {
    const card = document.querySelector<HTMLElement>('section [aria-roledescription=draggable]');

    if (!card) throw new Error('no lead card');

    const box = card.getBoundingClientRect();
    const [x0, y0] = [box.x + 20, box.y + 20];
    const samples: Sample[] = [];
    let dragged = false;

    window.perf.pointer('pointerdown', x0, y0, card);

    for (let step = 1; step <= 30; step++) {
      const x = x0 + (step <= 15 ? step : 30 - step) * 40;

      samples.push(
        await window.perf.time(() => window.perf.pointer('pointermove', x, y0, document)),
      );
      // The board shows a grabbing cursor while dnd-kit drags.
      dragged ||= Boolean(document.querySelector('.cursor-grabbing'));
    }

    window.perf.pointer('pointerup', x0, y0, document);

    if (!dragged) throw new Error('the board drag never started');

    return samples;
  });

  await page.evaluate(() => localStorage.setItem('erxes_leads_view', JSON.stringify('table')));

  // The first moves activate the drag; the rest are steady state.
  return { 'lead board: drag a card': summarize(moves.slice(2)) };
};

export const editor = async (page: Page, id: string) => {
  const name = page.locator('input[id$="-name"]');

  await page.goto(`/automations/${id}`);
  await name.waitFor();
  await settle(page);
  await name.focus();

  const typing = await page.evaluate(() =>
    window.perf.repeat(26, (i) => {
      const input = document.querySelector<HTMLInputElement>('input[id$="-name"]');

      if (input) window.perf.type(input, 'Follow up on leads quickly'.charAt(i));
    }),
  );

  const steps = await page.evaluate(() =>
    window.perf.repeat(20, (i) => {
      const buttons = [...document.querySelectorAll<HTMLElement>('button')].filter((button) =>
        /^(Trigger|Action|Wait for|If \/ else)\S/.test(button.textContent?.trim() ?? ''),
      );

      buttons[i % buttons.length]?.click();
    }),
  );

  return {
    'automation editor: type in name': summarize(typing),
    'automation editor: select a step': summarize(steps),
  };
};
