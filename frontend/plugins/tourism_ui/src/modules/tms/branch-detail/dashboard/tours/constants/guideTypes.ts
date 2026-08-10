export const GUIDE_TYPES = [
  { value: 'leader', label: 'Leader' },
  { value: 'guide', label: 'Guide' },
  { value: 'driver', label: 'Driver' },
  { value: 'assistant', label: 'Assistant' },
  { value: 'translator', label: 'Translator' },
  { value: 'cook', label: 'Cook' },
  { value: 'porter', label: 'Porter' },
  { value: 'other', label: 'Other' },
] as const;

export type GuideType = (typeof GUIDE_TYPES)[number]['value'];

export const GUIDE_TYPE_LABELS: Record<string, string> = GUIDE_TYPES.reduce(
  (acc, opt) => {
    acc[opt.value] = opt.label;
    return acc;
  },
  {} as Record<string, string>,
);
