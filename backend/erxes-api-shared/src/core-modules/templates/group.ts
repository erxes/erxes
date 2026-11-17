import type { TTemplate } from './types';

export const TEMPLATE_SEGMENT_PART = 'core:segments.segment';

/**
 * Where a template sits in the gallery, read from what it builds rather than
 * declared: no journeys is a segment, one is an automation, more is a
 * solution such as an AI employee.
 */
export const TEMPLATE_GROUPS = {
  SEGMENT: 'segment',
  AUTOMATION: 'automation',
  SOLUTION: 'solution',
} as const;

export type TTemplateGroup =
  (typeof TEMPLATE_GROUPS)[keyof typeof TEMPLATE_GROUPS];

export const templateGroupOf = (
  template: Pick<TTemplate, 'journeys'>,
): TTemplateGroup => {
  if (!template.journeys.length) {
    return TEMPLATE_GROUPS.SEGMENT;
  }

  return template.journeys.length === 1
    ? TEMPLATE_GROUPS.AUTOMATION
    : TEMPLATE_GROUPS.SOLUTION;
};

/** Part keys a journey reads as `{{ parts.<key> }}`. */
export const templatePartKeysUsedByJourneys = (
  template: Pick<TTemplate, 'journeys'>,
) =>
  new Set(
    [
      ...JSON.stringify(template.journeys).matchAll(
        /\{\{\s*parts\.([A-Za-z0-9_-]+)/g,
      ),
    ].map(([, key]) => key),
  );
