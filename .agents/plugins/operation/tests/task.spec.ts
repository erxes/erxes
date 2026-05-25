/**
 * Eval files (verify these after changes — re-run this spec):
 *   backend/plugins/operation_api/src/modules/task/db/models/Task.ts
 *   backend/plugins/operation_api/src/modules/task/db/definitions/task.ts
 *   backend/plugins/operation_api/src/modules/task/graphql/schemas/task.ts
 *   frontend/plugins/operation_ui/src/pages/TasksPage.tsx
 *   frontend/plugins/operation_ui/src/modules/task/components/TasksFilter.tsx
 *   frontend/plugins/operation_ui/src/modules/task/hooks/useGetTasks.tsx
 *
 * Module doc: ../modules/task.md
 *
 * Test plan: exercises the task-pipeline user surface via the host app — operation tasks
 * landing page, checking the breadcrumbs, view toggles, presence of filters, and view controls.
 */
import { test, expect } from '@playwright/test';

test.describe('operation > tasks (host UI)', () => {
  test('tasks index renders Tasks breadcrumb and sub-toggles', async ({ page }) => {
    // frontend/plugins/operation_ui/src/modules/task/components/breadcrump/TaskBreadCrump.tsx:16 — <Link to={link}>Tasks</Link>
    await page.goto('/operation/tasks');

    await expect(
      page.getByRole('link', { name: /tasks/i }),
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: /assigned/i }),
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: /created/i }),
    ).toBeVisible();
  });

  test('tasks page has filter popover trigger present', async ({ page }) => {
    // TasksFilter.tsx — Filter popover trigger
    await page.goto('/operation/tasks');

    await expect(
      page.getByRole('button', { name: /filter/i }),
    ).toBeVisible();
  });

  test('tasks page has display view control present', async ({ page }) => {
    // TasksViewControl.tsx
    await page.goto('/operation/tasks');

    await expect(
      page.getByRole('button', { name: /display/i }),
    ).toBeVisible();
  });
});
