import { type ComponentProps, lazy, Suspense } from 'react';

const Editor = lazy(async () => ({
  default: (await import('./ConditionsEditor')).ConditionsEditor,
}));

/**
 * Edits a condition group of rules, for automations and advanced filters.
 * It is fetched the first time one renders: erxes-ui is one shared chunk every route loads,
 * and only automations and a list's advanced filter edit conditions.
 */
export const ConditionsEditor = (props: ComponentProps<typeof Editor>) => (
  <Suspense>
    <Editor {...props} />
  </Suspense>
);
