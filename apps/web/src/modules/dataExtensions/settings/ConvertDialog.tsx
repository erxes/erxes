import type { DataExtensionField } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconArrowRight } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Badge, Button, Checkbox, Dialog, Label, Spinner } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRefreshDataModel, useTypeLabel } from '../dataQueries';
import { type ConvertibleType, convertTargets } from '../fieldTypes';
import { FormError } from '../form/DraftEditor';
import { useDataErrorText } from '../useDataErrors';
import { SelectRow } from './SettingRow';

type Conversion = Awaited<ReturnType<typeof orpc.dataChanges.convert.call>>;

/** What a dry run found: how many values carry over, how many don't, and some that don't. */
const DryRun = ({ result }: { result: Conversion }) => {
  const { t } = useTranslation('data', { keyPrefix: 'convert' });

  return (
    <div className="flex flex-col gap-2 rounded-md border p-3 text-sm">
      <p>
        {t('converted', '{{count}} values carry over.', { count: result.converted })}{' '}
        {result.unconvertible > 0 &&
          t('unconvertible', '{{count}} don’t fit and would be cleared.', {
            count: result.unconvertible,
          })}
      </p>
      {result.samples.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {result.samples.map((sample) => (
            <Badge key={sample} variant="warning">
              {sample}
            </Badge>
          ))}
        </div>
      )}
      {result.options.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {t('options', 'Options: {{options}}', {
            options: result.options.map((option) => option.label).join(', '),
          })}
        </p>
      )}
    </div>
  );
};

const ConvertForm = ({ field, onDone }: { field: DataExtensionField; onDone: () => void }) => {
  const { t } = useTranslation('data', { keyPrefix: 'convert' });
  const typeLabel = useTypeLabel();
  const checkId = useId();
  const refresh = useRefreshDataModel();
  const errorText = useDataErrorText();
  const targets = convertTargets(field.type);
  const [type, setType] = useState<ConvertibleType | undefined>(targets[0]);
  const [clear, setClear] = useState(false);
  const dryRun = useMutation(orpc.dataChanges.convert.mutationOptions());

  const apply = useMutation(
    orpc.dataChanges.convert.mutationOptions({ onSuccess: () => void refresh().then(onDone) }),
  );

  const result = dryRun.data;
  const error = dryRun.error ?? apply.error;

  const pick = (next: string) => {
    setType(targets.find((target) => target === next));
    setClear(false);
    dryRun.reset();
  };

  return (
    <div className="flex flex-col gap-4">
      <FormError message={error ? errorText(error) : null} />
      <div className="flex items-end gap-3">
        <Badge variant="secondary" size="lg">
          {typeLabel(field.type)}
        </Badge>
        <IconArrowRight className="mb-1.5 size-4 text-muted-foreground" />
        <SelectRow
          label={t('to', 'Convert to')}
          value={type ?? ''}
          options={targets.map((target) => ({ value: target, label: typeLabel(target) }))}
          onChange={pick}
        />
      </div>
      {result && <DryRun result={result} />}
      {result && result.unconvertible > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox id={checkId} checked={clear} onCheckedChange={(checked) => setClear(checked)} />
          <Label htmlFor={checkId} variant="plain">
            {t('clear', 'Clear the values that don’t fit')}
          </Label>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          disabled={!type || dryRun.isPending}
          onClick={() => type && dryRun.mutate({ id: field.id, type })}
        >
          {dryRun.isPending && <Spinner size="sm" />}
          {t('dry-run', 'Check first')}
        </Button>
        <Button
          disabled={!type || !result || apply.isPending || (result.unconvertible > 0 && !clear)}
          onClick={() =>
            type && apply.mutate({ id: field.id, type, apply: true, clearUnconvertible: clear })
          }
        >
          {apply.isPending && <Spinner size="sm" />}
          {t('apply', 'Convert')}
        </Button>
      </div>
    </div>
  );
};

/** Converts a field to another type: a dry run first, then the conversion. */
export const ConvertDialog = ({
  field,
  open,
  onOpenChange,
}: {
  field: DataExtensionField;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'convert' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('title', 'Convert {{label}}', { label: field.label })}
          description={t(
            'description',
            'Values carry over where they fit the new type. Check first to see how many do.',
          )}
        />
        {open && <ConvertForm field={field} onDone={() => onOpenChange(false)} />}
      </Dialog.Content>
    </Dialog>
  );
};
