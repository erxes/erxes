import { useEffect, useId, useState } from 'react';
import { Button, Label, Spinner, Textarea } from 'erxes-ui';
import {
  IconCheck,
  IconCopy,
  IconFileImport,
  IconRefresh,
} from '@tabler/icons-react';
import { ReportForm } from '@/tunable-reports/fields';
import { useReportTranslation } from '@/tunable-reports/locales';
import {
  formatReportTransfer,
  parseReportTransfer,
} from '@/tunable-reports/reportTransfer';
import { useReportTransfer } from '@/tunable-reports/useReportTransfer';
import { sortReportValues } from '@/tunable-reports/values';
import { notifyMutationResult } from '@/utils/graphqlMutation';

const COPIED_MS = 1500;

/**
 * Portable report JSON: fill it from the editor state (ids → codes), copy it,
 * or paste a definition and apply it to the editor (codes → ids). Applying only
 * changes unsaved form state; the user still reviews and saves the report.
 */
export const ReportTransferField = ({
  form,
  currentReportId,
  canApply,
}: {
  form: ReportForm;
  currentReportId?: string;
  canApply: boolean;
}) => {
  const { t } = useReportTranslation();
  const inputId = useId();
  const transfer = useReportTransfer();
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const missingMessage = (missing: string[]) =>
    t('jsonMissing', { items: missing.join(', ') });
  const fill = async () => {
    try {
      const result = await transfer.fill(form.getValues(), currentReportId);
      setText(formatReportTransfer(result.value));
      setError(result.missing.length ? missingMessage(result.missing) : '');
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : String(error_));
    }
  };
  const apply = async () => {
    const parsed = parseReportTransfer(text);
    if (!parsed.success) {
      setError(t('jsonInvalid', { error: parsed.error }));
      return;
    }
    try {
      const result = await transfer.apply(parsed.data);
      if (result.missing.length) {
        setError(missingMessage(result.missing));
        return;
      }
      // Keep the saved defaults so the editor stays dirty until it is saved.
      form.reset(sortReportValues(result.value), { keepDefaultValues: true });
      void form.trigger();
      setError('');
      notifyMutationResult(true, t('jsonApplied'));
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : String(error_));
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      notifyMutationResult(false, t('copyFailed'));
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{t('reportJson')}</Label>
      <p className="text-sm text-muted-foreground">{t('reportJsonHint')}</p>
      <Textarea
        id={inputId}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setError('');
        }}
        placeholder={t('reportJsonPlaceholder')}
        rows={12}
        spellCheck={false}
        className="font-mono text-xs"
        aria-invalid={Boolean(error)}
      />
      {error && (
        <p role="alert" className="text-sm text-destructive break-words">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={transfer.loading}
          onClick={() => void fill()}
        >
          {transfer.loading ? <Spinner /> : <IconRefresh />}
          {t('fillFromReport')}
        </Button>
        <Button
          type="button"
          disabled={!canApply || !text.trim() || transfer.loading}
          onClick={() => void apply()}
        >
          <IconFileImport />
          {t('applyJson')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!text.trim()}
          onClick={() => void copy()}
        >
          {copied ? <IconCheck /> : <IconCopy />}
          {copied ? t('copied') : t('copy')}
        </Button>
      </div>
    </div>
  );
};
