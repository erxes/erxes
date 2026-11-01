import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const url = pathToFileURL(path.resolve('design/chat-concept.html')).href;
const launch = () => chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });

test('Lens is the default and pins into the Companion without losing the conversation', async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(url);

    // Default presentation is the floating Lens, with the current page shared.
    await page.locator('#lens').waitFor();
    assert.equal(await page.locator('#dock').isHidden(), true);
    assert.equal(await page.locator('#launch').getAttribute('aria-expanded'), 'true');
    assert.match(await page.locator('#lens .chip.page').innerText(), /Home/);
    assert.equal(await page.locator('#send').isDisabled(), true);
    await page.screenshot({ path: 'design/screenshots/lens-empty.png' });

    // @ mentions add context chips; / opens skills.
    await page.locator('#ta').fill('@Auto');
    await page.keyboard.press('Enter');
    assert.match(await page.locator('#lens .chips').innerText(), /Automations/);
    await page.getByRole('button', { name: 'Remove Automations' }).click();
    await page.locator('#ta').fill('/');
    assert.match(await page.locator('.menu').innerText(), /Draft a reply/);
    await page.keyboard.press('Escape');
    await page.locator('#ta').fill('');

    // Asking annotates the page with numbered sources.
    await page.locator('[data-sug="tri"]').click();
    await page.locator('.cite').first().waitFor();
    assert.equal(await page.locator('.pin').count(), 6);
    assert.equal(await page.locator('#page').evaluate(el => el.classList.contains('dim')), true);
    await page.screenshot({ path: 'design/screenshots/lens-answer.png' });

    // Actions run directly from the answer and can be undone.
    await page.getByRole('button', { name: 'Assign all to me' }).click();
    assert.match(await page.locator('.done').innerText(), /Assigned 6 triages to you/);
    assert.equal(await page.locator('#tri .av.me-av').count(), 6);
    await page.screenshot({ path: 'design/screenshots/lens-action.png' });
    await page.getByRole('button', { name: 'Undo' }).click();
    assert.equal(await page.locator('#tri .av.me-av').count(), 0);
    assert.equal(await page.getByRole('button', { name: 'Assign all to me' }).isVisible(), true);

    // Draft survives pinning; Companion keeps the same conversation and page sources.
    await page.locator('#ta').fill('Draft kept across modes');
    await page.getByRole('button', { name: 'Pin to side panel' }).click();
    assert.equal(await page.locator('#dock').isVisible(), true);
    assert.equal(await page.locator('#lens').isHidden(), true);
    assert.equal(await page.locator('#ta').inputValue(), 'Draft kept across modes');
    assert.match(await page.locator('#dock').innerText(), /6 new triages/);
    assert.equal(await page.locator('.pin').count(), 6);
    await page.screenshot({ path: 'design/screenshots/companion-answer.png' });
    await page.getByRole('button', { name: 'Unpin and float over page' }).click();
    assert.equal(await page.locator('#lens').isVisible(), true);

    // Escape closes menus first, then the Assistant; ⌘J reopens it.
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#launch').getAttribute('aria-expanded'), 'false');
    await page.keyboard.press('Meta+j');
    assert.equal(await page.locator('#launch').getAttribute('aria-expanded'), 'true');

    // Layout: no horizontal overflow; pointer targets meet WCAG 2.5.8 (24px).
    for (const width of [375, 768, 1280, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const m = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        small: [...document.querySelectorAll('#lens button,#dock button')].filter(el => {
          // Layout size, so entrance animations (scale) do not skew the measurement.
          const w = el.offsetWidth, h = el.offsetHeight;
          return w > 0 && (w < 24 || h < 24);
        }).map(el => el.getAttribute('aria-label') || el.textContent.trim())
      }));
      assert.equal(m.overflow, false, `Horizontal overflow at ${width}px`);
      assert.deepEqual(m.small, [], `Targets under 24px at ${width}px`);
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});

test('touch devices get 44px Assistant controls', async () => {
  const browser = await launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.goto(url);
    await page.locator('#lens').waitFor();
    const small = await page.evaluate(() => [...document.querySelectorAll('#lens .ibtn,#lens .send,#lens .mpill,#lens .pillsug')]
      .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height < 44; })
      .map(el => el.getAttribute('aria-label') || el.textContent.trim()));
    assert.deepEqual(small, []);
    await page.screenshot({ path: 'design/screenshots/lens-mobile.png' });
  } finally {
    await browser.close();
  }
});
