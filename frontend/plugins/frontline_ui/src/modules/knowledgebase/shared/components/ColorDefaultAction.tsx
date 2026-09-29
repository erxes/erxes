import { TFunction } from 'i18next';

const sameColor = (left?: string, right?: string) =>
  (left ?? '').trim().toLowerCase() === (right ?? '').trim().toLowerCase();

export function ColorDefaultAction({
  value,
  defaultValue,
  onReset,
  t,
}: Readonly<{
  value?: string;
  defaultValue?: string;
  onReset: (value: string) => void;
  t: TFunction;
}>) {
  if (!defaultValue || sameColor(value, defaultValue)) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => onReset(defaultValue)}
      title={defaultValue}
      className="inline-flex items-center gap-1.5 rounded text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:underline"
    >
      <span
        aria-hidden="true"
        className="size-2.5 rounded-full border border-border"
        style={{ backgroundColor: defaultValue }}
      />
      {t('kb-color-default', 'Default')}
    </button>
  );
}
