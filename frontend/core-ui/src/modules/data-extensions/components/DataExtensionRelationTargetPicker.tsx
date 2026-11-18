import { ChoiceboxGroup } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IDataExtensionRecordType,
  recordTypeGroup,
} from 'ui-modules';

/**
 * The record type a relation links to, as one card per record type grouped
 * by the module that owns it, so both modules are visible at once.
 */
export const DataExtensionRelationTargetPicker = ({
  recordTypes,
  value,
  onChange,
  recordTypeLabel,
}: {
  recordTypes: IDataExtensionRecordType[];
  value: string;
  onChange: (value: string) => void;
  recordTypeLabel: (recordType: string) => string;
}) => {
  const { t } = useTranslation('dataExtensions');
  const groups = useMemo(() => {
    const byOwner = new Map<string, IDataExtensionRecordType[]>();

    for (const candidate of recordTypes) {
      byOwner.set(recordTypeGroup(candidate), [
        ...(byOwner.get(recordTypeGroup(candidate)) || []),
        candidate,
      ]);
    }

    return Array.from(byOwner.entries());
  }, [recordTypes]);

  return (
    <ChoiceboxGroup
      value={value}
      onValueChange={onChange}
      aria-label={t('relation.target')}
      className="gap-4"
    >
      {groups.map(([owner, members]) => (
        <div key={owner} className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {t(`owners.${owner}`, owner)}
          </span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {members.map((candidate) => {
              const label = recordTypeLabel(candidate.recordType);

              return (
                <ChoiceboxGroup.Item
                  key={candidate.recordType}
                  value={candidate.recordType}
                  className="p-2"
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="flex size-6 shrink-0 items-center justify-center rounded bg-background text-[11px] font-semibold uppercase"
                    >
                      {label.charAt(0)}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-xs font-medium">
                        {label}
                      </span>
                      <span className="truncate text-[11px] font-normal text-muted-foreground">
                        {t('map.field-count', { count: candidate.fieldCount })}
                      </span>
                    </span>
                  </span>
                </ChoiceboxGroup.Item>
              );
            })}
          </div>
        </div>
      ))}
    </ChoiceboxGroup>
  );
};
