import { useTemplateWizardContext } from '@/template/context/TemplateWizardContext';
import { TTemplateRequirement } from '@/template/types';
import {
  isTemplateAnswered,
  isTemplateDefaultAnswer,
} from '@/template/utils/templateWizard';
import { KeyboardEvent, useCallback, useEffect, useRef } from 'react';

// Pickers keep Enter for themselves
const OWNS_ENTER = '[role="combobox"], [cmdk-root]';
// The body's duration-300: it is measured once it has grown
const EXPAND_MS = 300;

/**
 * One step of the wizard: whether it is done, open or locked, whether its
 * answer is still the default, and moving on with Enter. A collapsed body
 * stays mounted, so its picker can still name what was chosen, but inert.
 */
export const useTemplateStepRow = (
  requirement: TTemplateRequirement,
  index: number,
) => {
  const {
    answers,
    initial,
    labels,
    expandedKey,
    isStepOpen,
    answer,
    setLabel,
    expand,
    complete,
  } = useTemplateWizardContext();
  const { key, kind, input } = requirement;
  const value = answers[key];
  const isExpanded = expandedKey === key;
  const isDone = isTemplateAnswered(value);
  const rowRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const wasExpanded = useRef(isExpanded);

  useEffect(() => {
    const body = bodyRef.current;

    if (body) {
      body.inert = !isExpanded;
    }

    const opened = isExpanded && !wasExpanded.current;
    wasExpanded.current = isExpanded;

    if (!opened) {
      return;
    }

    // Opened by moving on, not on load: bring it into view, ready to type
    const timer = window.setTimeout(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

      rowRef.current?.scrollIntoView({
        block: 'nearest',
        behavior: reduce.matches ? 'auto' : 'smooth',
      });
      body
        ?.querySelector<HTMLElement>('input:not([type="hidden"]), textarea')
        ?.focus({ preventScroll: true });
    }, EXPAND_MS);

    return () => window.clearTimeout(timer);
  }, [isExpanded]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      const isMultiline =
        target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (
        event.key !== 'Enter' ||
        event.nativeEvent.isComposing ||
        !isDone ||
        !(target.tagName === 'INPUT' || isMultiline) ||
        // Sheets and popovers it opened bubble here through React only
        !event.currentTarget.contains(target) ||
        target.closest(OWNS_ENTER) ||
        (isMultiline && !(event.metaKey || event.ctrlKey))
      ) {
        return;
      }

      event.preventDefault();
      complete();
    },
    [isDone, complete],
  );

  const toggle = useCallback(() => expand(key), [expand, key]);
  const onChange = useCallback(
    (next: unknown) => answer(key, next),
    [answer, key],
  );
  const onLabel = useCallback(
    (next: string | null) => setLabel(key, next),
    [setLabel, key],
  );

  return {
    value,
    label: labels[key],
    dependsOnValue: requirement.dependsOn
      ? answers[requirement.dependsOn]
      : undefined,
    isExpanded,
    isOpen: isStepOpen(index),
    isDone,
    isDefault: isTemplateDefaultAnswer(value, initial[key]),
    // Only written answers move on with Enter; a picker has no Enter of its own
    enterHint:
      kind === 'core:text'
        ? input?.multiline
          ? 'press-mod-enter'
          : 'press-enter'
        : null,
    rowRef,
    bodyRef,
    toggle,
    onChange,
    onLabel,
    onContinue: complete,
    onKeyDown,
  };
};
