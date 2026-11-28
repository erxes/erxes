import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';
import { IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import { skipToken, useQuery } from '@tanstack/react-query';
import { Badge, Button, Label, Spinner, Textarea } from 'erxes-ui';
import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { useFields, useRecordType } from '../../dataQueries';

/** Where in the formula the API found its problem: the last part of the issue's path. */
const problemOf = (error: unknown) => {
  if (!isApiError(error, 'INVALID_INPUT')) return { message: messageOf(error), at: null };

  const [issue] = error.data.issues;
  const at = issue?.path.at(-1);

  return { message: issue?.message ?? messageOf(error), at: typeof at === 'number' ? at : null };
};

/** The first record of a custom object, so the preview shows a real value. */
const useSampleRecord = (recordType: string) => {
  const [owner, key = ''] = recordType.split('.');

  const first = useQuery(
    orpc.dataRecords.list.queryOptions({
      input: owner === 'custom' ? { objectKey: key, limit: 1 } : skipToken,
      staleTime: 60_000,
    }),
  );

  return first.data?.data[0];
};

/** What the formula gives, its value on a sample record, or where it is wrong. */
const FormulaPreview = ({ recordType, expression }: { recordType: string; expression: string }) => {
  const { t } = useTranslation('data', { keyPrefix: 'formula' });
  const [debounced] = useDebounce(expression.trim(), 400);
  const sample = useSampleRecord(recordType);

  const preview = useQuery(
    orpc.dataFields.preview.queryOptions({
      input: debounced
        ? { recordType, formula: { expression: debounced }, recordId: sample?.id }
        : skipToken,
      retry: false,
    }),
  );

  if (!debounced) return null;

  if (preview.isPending) return <Spinner size="sm" />;

  if (preview.isError) {
    const { message, at } = problemOf(preview.error);

    return (
      <div role="alert" className="flex flex-col gap-1 rounded-md bg-destructive/10 p-2 text-xs">
        <p className="flex items-center gap-1 text-destructive-text">
          <IconAlertTriangle className="size-3.5" />
          {at === null
            ? message
            : t('error-at', '{{message}} (at character {{at}})', { message, at: at + 1 })}
        </p>
        {at !== null && (
          <pre className="overflow-x-auto font-mono text-foreground">
            {debounced.slice(0, at)}
            <mark className="rounded-xs bg-destructive/30 text-foreground">
              {debounced.slice(at, at + 1) || ' '}
            </mark>
            {debounced.slice(at + 1)}
          </pre>
        )}
      </div>
    );
  }

  const { result, value } = preview.data;

  return (
    <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <IconCheck className="size-3.5" />
      {t('gives', 'Gives a {{type}}', { type: t(`results.${result}`, result) })}
      {sample && (
        <span>
          {t('on-sample', 'On {{name}}:', { name: sample.label ?? sample.id })}{' '}
          <span className="font-medium text-foreground">
            {value === null ? '—' : JSON.stringify(value)}
          </span>
        </span>
      )}
    </p>
  );
};

/**
 * A formula: `{key}` reads a field of the record (its own, or the type's own fields, such as a
 * customer's firstName); a click on one adds it where the cursor is. The preview checks it as
 * it is typed.
 */
export const FormulaEditor = ({
  recordType,
  fieldKey,
  expression,
  onChange,
}: {
  recordType: string;
  /** The field being edited, which can't read itself. */
  fieldKey: string;
  expression: string;
  onChange: (expression: string) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'formula' });
  const id = useId();
  const input = useRef<HTMLTextAreaElement>(null);
  const { fields } = useFields(recordType);
  const native = useRecordType(recordType)?.nativeFields ?? [];

  const tokens = [
    ...fields
      .filter((field) => field.key !== fieldKey)
      .map((field) => ({ key: field.key, label: field.label })),
    ...native.map((field) => ({ key: field.key, label: field.label })),
  ];

  const insert = (key: string) => {
    const at = input.current?.selectionStart ?? expression.length;

    onChange(`${expression.slice(0, at)}{${key}}${expression.slice(at)}`);
    input.current?.focus();
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{t('label', 'Formula')}</Label>
      <Textarea
        id={id}
        ref={input}
        value={expression}
        placeholder='IF({stage} == "won", {amount}, 0)'
        onChange={({ target }) => onChange(target.value)}
      />
      <div className="flex flex-wrap gap-1">
        {tokens.map((token) => (
          <Button
            key={token.key}
            type="button"
            variant="secondary"
            size="sm"
            title={token.label}
            onClick={() => insert(token.key)}
          >
            {`{${token.key}}`}
          </Button>
        ))}
        {!tokens.length && <Badge variant="muted">{t('no-fields', 'No fields to read yet')}</Badge>}
      </div>
      <FormulaPreview recordType={recordType} expression={expression} />
    </div>
  );
};
