import type { CustomValue, FieldContentType } from '@erxes/core-contract';
import { IconListDetails } from '@tabler/icons-react';
import { Button, Collapsible, Empty, Spinner, buttonVariants } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { messageOf } from '@erxes/core-contract/client';
import { PanelField } from '~/modules/side-panel/PanelField';
import { propertyPaths } from '~/lib/paths';
import { CustomFieldCell } from './CustomFieldCell';
import { FIELD_TYPES_OBJECT } from './fieldTypes';
import { useFields } from './useFields';

const EmptyProperties = ({ contentType }: { contentType: FieldContentType }) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconListDetails />
        </Empty.Media>
        <Empty.Title>{t('no-properties', 'No properties found')}</Empty.Title>
        <Empty.Description>
          {t('no-properties-hint', 'Get started by creating your first property.')}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Link to={propertyPaths(contentType).list} className={buttonVariants({ size: 'sm' })}>
          {t('create-property', 'Create property')}
        </Link>
      </Empty.Content>
    </Empty>
  );
};

/**
 * A record's custom field values: one collapsible card per field group, in
 * group order, each value edited in place. `onSave` gets the changed field.
 */
export const CustomFieldSections = ({
  contentType,
  scope,
  values,
  onSave,
  empty = <EmptyProperties contentType={contentType} />,
}: {
  contentType: FieldContentType;
  /** Hotkey scope prefix, unique to the record on screen. */
  scope: string;
  values: Record<string, CustomValue> | undefined;
  onSave: (patch: Record<string, CustomValue | null>) => void;
  /** Shown when the record type has no properties yet. */
  empty?: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { sections, loading, error } = useFields(contentType);

  if (error) return <p className="px-2 py-6 text-sm text-destructive">{messageOf(error)}</p>;

  if (loading || !values) return <Spinner area="sm" />;

  if (sections.length === 0) return empty;

  return (
    <div className="flex flex-col gap-2">
      {sections.map(({ group, fields }) => (
        <Collapsible key={group?.id ?? 'ungrouped'} defaultOpen className="group">
          <div className="flex flex-col rounded-xl bg-foreground/5 p-1 pt-0">
            <div className="flex h-7 shrink-0 items-center justify-between pr-1">
              <Collapsible.Trigger render={<Button variant="ghost" size="xs" />}>
                <Collapsible.TriggerIcon className="size-3" />
                <span className="font-mono uppercase">
                  {group?.name ?? t('properties', 'Properties')}
                </span>
              </Collapsible.Trigger>
            </div>
            <Collapsible.Panel>
              <div className="flex flex-col gap-1 rounded-lg bg-background p-3 shadow-sm">
                {fields.map((field) => (
                  <PanelField
                    key={field.id}
                    icon={FIELD_TYPES_OBJECT[field.type].icon}
                    label={field.label}
                  >
                    <CustomFieldCell
                      field={field}
                      scope={`${scope}.${field.id}`}
                      value={values[field.id]}
                      onSave={(value) => onSave({ [field.id]: value })}
                    />
                  </PanelField>
                ))}
              </div>
            </Collapsible.Panel>
          </div>
        </Collapsible>
      ))}
    </div>
  );
};
