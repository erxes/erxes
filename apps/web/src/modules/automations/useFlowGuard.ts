import type { AutomationDefinition, AutomationStep } from '@erxes/core-contract';
import { useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { Catalog } from './automationQueries';
import { breaksAnything, type Fit, fitFlow } from './builder/flowFit';
import type { useAutomationDraft } from './useAutomationEditor';

type Draft = ReturnType<typeof useAutomationDraft>;

const useFitText = () => {
  const { t } = useTranslation('automations');

  return {
    short: (fit: Fit) =>
      [
        fit.removed.length
          ? t('fit-removes', 'Removes {{count}} step', { count: fit.removed.length })
          : '',
        fit.cleared ? t('fit-clears', 'Clears {{count}} data field', { count: fit.cleared }) : '',
      ]
        .filter(Boolean)
        .join(' · '),
    long: (fit: Fit) =>
      [
        fit.removed.length
          ? t('fit-removes-steps', 'These steps can’t run with it and are removed: {{steps}}.', {
              steps: fit.removed.join(', '),
            })
          : '',
        fit.cleared
          ? t(
              'fit-clears-fields',
              '{{count}} data field or condition used data it no longer has and is cleared.',
              { count: fit.cleared },
            )
          : '',
      ]
        .filter(Boolean)
        .join(' '),
  };
};

/**
 * The draft, with every change checked against the steps it would break: a trigger that can't
 * run them, or data a later step used. When something breaks, the member confirms, and the
 * change goes in with those steps removed and that data cleared.
 */
export const useFlowGuard = (draft: Draft, catalog: Pick<Catalog, 'actions' | 'triggers'>) => {
  const { t } = useTranslation('automations');
  const { confirm } = useConfirm();
  const text = useFitText();

  const setDefinition = (next: AutomationDefinition) => {
    const fit = fitFlow(draft.definition, next, catalog);

    if (!breaksAnything(fit)) {
      draft.setDefinition(next);

      return;
    }

    const apply = async () => {
      await confirm({
        message: t('fit-confirm', 'This change breaks other steps'),
        options: { description: text.long(fit), okLabel: t('fit-ok', 'Change and fix them') },
      });

      draft.setDefinition(fit.definition);
    };

    void apply();
  };

  return {
    ...draft,
    setDefinition,
    setSteps: (steps: AutomationStep[]) => setDefinition({ ...draft.definition, steps }),
    /** What picking this trigger would break, for a note on the option. */
    triggerCost: (trigger: AutomationDefinition['trigger']) =>
      text.short(fitFlow(draft.definition, { ...draft.definition, trigger }, catalog)),
  };
};
