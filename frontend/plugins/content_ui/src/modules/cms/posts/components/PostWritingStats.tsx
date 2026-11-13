import { useMemo } from 'react';
import { FieldValues, UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const WORDS_PER_MINUTE = 200;

const countWords = (html: string) => {
  if (!html) return 0;

  const text =
    new DOMParser().parseFromString(html, 'text/html').body.textContent || '';

  return text.split(/\s+/).filter(Boolean).length;
};

export const PostWritingStats = ({
  form,
}: {
  form: UseFormReturn<FieldValues>;
}) => {
  const { t } = useTranslation('content');
  const content = useWatch({ control: form.control, name: 'content' });
  const words = useMemo(() => countWords(content || ''), [content]);

  if (!words) return null;

  return (
    <div className="flex justify-end gap-1.5 pt-2 text-xs text-muted-foreground">
      <span>{t('words-count', { count: words })}</span>
      <span aria-hidden>·</span>
      <span>
        {t('min-read', {
          count: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)),
        })}
      </span>
    </div>
  );
};
