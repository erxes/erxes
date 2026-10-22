import { useQuery } from '@apollo/client';
import { Avatar, Button, Checkbox, Input, readImage } from 'erxes-ui';
import { useEffect, useState } from 'react';
import {
  DATA_MODEL_RELATION_OPTIONS,
  DATA_MODEL_RELATION_REFERENCES,
} from '../graphql';
import type { DataModelRelationOption, ModelField, OffsetList } from '../types';
import { relationValueIds } from '../recordDocuments';
import { dataModelErrorMessage } from '../errorMessage';

export const DataModelRelationInput = ({
  field,
  value,
  onChange,
  id,
  disabled,
  invalid,
  describedBy,
  maxSelections = 100,
}: {
  field: ModelField;
  value: unknown;
  onChange: (value: unknown) => void;
  id: string;
  disabled: boolean;
  invalid?: boolean;
  describedBy?: string;
  maxSelections?: number;
}) => {
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const normalized = relationValueIds(field, value);
  const selected = (
    Array.isArray(normalized) ? normalized : normalized ? [normalized] : []
  ).filter((entry): entry is string => typeof entry === 'string');
  const { data, loading, error, refetch } = useQuery<{
    dataModelRelationOptions: OffsetList<DataModelRelationOption>;
  }>(DATA_MODEL_RELATION_OPTIONS, {
    variables: { fieldId: field._id, search, limit: 25, offset },
    skip: Boolean(field.relation?.isInverse),
    fetchPolicy: 'cache-and-network',
  });
  const selectedOptions = useQuery<{
    dataModelRelationOptions: OffsetList<DataModelRelationOption>;
  }>(DATA_MODEL_RELATION_REFERENCES, {
    variables: { fieldId: field._id, recordIds: selected },
    skip: !selected.length || Boolean(field.relation?.isInverse),
  });
  const result = data?.dataModelRelationOptions;
  useEffect(() => {
    if (result)
      setLabels((previous) => ({
        ...previous,
        ...Object.fromEntries(
          result.list.map((entry) => [entry._id, entry.label]),
        ),
      }));
  }, [result]);
  useEffect(() => {
    const options = selectedOptions.data?.dataModelRelationOptions.list;
    if (options)
      setLabels((previous) => ({
        ...previous,
        ...Object.fromEntries(options.map((entry) => [entry._id, entry.label])),
      }));
  }, [selectedOptions.data]);
  if (field.relation?.isInverse)
    return (
      <p className="text-sm text-muted-foreground">
        Reverse relation. Edit links on the related object.
      </p>
    );
  const toggle = (recordId: string) => {
    if (disabled) return;
    if (
      field.relation?.multiple &&
      !selected.includes(recordId) &&
      selected.length >= maxSelections
    )
      return;
    if (field.relation?.multiple)
      onChange(
        selected.includes(recordId)
          ? selected.filter((entry) => entry !== recordId)
          : [...selected, recordId],
      );
    else onChange(selected.includes(recordId) ? null : recordId);
  };
  return (
    <div
      id={id}
      role="group"
      aria-label={field.label}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      className="space-y-3 rounded-md border p-3"
    >
      <p className="text-xs text-muted-foreground">
        {field.relation?.multiple
          ? `Choose up to ${maxSelections} records.`
          : 'Choose one record. Choosing another replaces the current link.'}
      </p>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((recordId) => (
            <Button
              key={recordId}
              type="button"
              size="sm"
              variant="secondary"
              disabled={disabled}
              aria-label={`Remove ${labels[recordId] ?? 'linked record'}`}
              onClick={() => toggle(recordId)}
            >
              {labels[recordId] ??
                (selectedOptions.loading
                  ? 'Loading…'
                  : selectedOptions.error
                  ? 'Linked record'
                  : 'Unavailable record')}{' '}
              ×
            </Button>
          ))}
        </div>
      )}
      {selectedOptions.error && (
        <p role="alert" className="text-xs text-destructive">
          Could not load selected record names. Your links have not changed.
        </p>
      )}
      <Input
        aria-label={`Search ${field.label}`}
        placeholder="Search records…"
        value={search}
        disabled={disabled}
        onChange={(event) => {
          setSearch(event.target.value);
          setOffset(0);
        }}
      />
      {loading && (
        <p role="status" className="text-xs text-muted-foreground">
          Loading records…
        </p>
      )}
      {error ? (
        <div role="alert" className="text-sm text-destructive">
          {dataModelErrorMessage(error)}
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => {
              void refetch().catch(() => undefined);
            }}
          >
            Try again
          </Button>
        </div>
      ) : (
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {result?.list.map((option) => (
            <label
              key={option._id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={selected.includes(option._id)}
                disabled={
                  disabled ||
                  (Boolean(field.relation?.multiple) &&
                    selected.length >= maxSelections &&
                    !selected.includes(option._id))
                }
                onCheckedChange={() => toggle(option._id)}
              />
              {option.imageUrl && (
                <Avatar size="sm">
                  <Avatar.Image src={readImage(option.imageUrl)} alt="" />
                  <Avatar.Fallback>{option.label.slice(0, 1)}</Avatar.Fallback>
                </Avatar>
              )}
              <span className="truncate" title={option._id}>
                {option.label}
              </span>
            </label>
          ))}
          {!loading && !result?.list.length && (
            <p className="text-sm text-muted-foreground">
              {search
                ? 'No matching records. Try a different name.'
                : 'No records to choose yet. Add a record to the related object first.'}
            </p>
          )}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || loading || offset === 0}
          onClick={() => setOffset(Math.max(0, offset - 25))}
        >
          Previous
        </Button>
        <span className="text-xs text-muted-foreground">
          {selected.length} selected
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={
            disabled || loading || !result || offset + 25 >= result.totalCount
          }
          onClick={() => setOffset(offset + 25)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
