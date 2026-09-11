import { Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TImportPreviewField } from '../../types/import/importTypes';

const MAX_INLINE_OPTIONS = 3;

/**
 * Describe the shape a field accepts, e.g. `date · e.g. YYYY-MM-DD`.
 *
 * A choice field lists only its first few options inline — the rest sit behind
 * a tooltip so a long option list does not push the layout around.
 */
export const ImportFieldFormat = ({
  field,
  emptyLabel,
}: {
  field?: TImportPreviewField;
  emptyLabel?: string;
}) => {
  const { t } = useTranslation('importExport');

  if (!field) {
    return (
      <span className="text-xs text-muted-foreground">
        {emptyLabel ?? t('column-skipped')}
      </span>
    );
  }

  const parts = [
    field.dataType !== 'text' ? field.dataType : null,
    field.example ? `e.g. ${field.example}` : null,
    field.required ? t('required').toLowerCase() : null,
  ].filter(Boolean);

  const summary = (
    <span className="text-xs text-muted-foreground">
      {parts.length ? parts.join(' · ') : t('free-text')}
    </span>
  );

  if (field.options.length <= MAX_INLINE_OPTIONS) {
    return summary;
  }

  // Self-contained: callers render this in lists and sheets that carry no
  // tooltip provider of their own.
  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span className="cursor-help text-xs text-muted-foreground underline decoration-dotted underline-offset-2">
            {parts.join(' · ')} (+{field.options.length - MAX_INLINE_OPTIONS})
          </span>
        </Tooltip.Trigger>
        <Tooltip.Content className="max-w-72 space-y-1">
          <p className="text-xs font-medium">{t('accepted-values')}</p>
          <p className="text-xs">{field.options.join(', ')}</p>
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
