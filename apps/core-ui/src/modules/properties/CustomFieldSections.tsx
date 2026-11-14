import type { CustomValue, FieldContentType } from '@erxes/core-contract';
import { IconListDetails } from '@tabler/icons-react';
import { Button, Collapsible, Spinner, buttonVariants } from 'erxes-ui';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { messageOf } from '~/lib/api';
import { PanelField } from '~/modules/side-panel/PanelField';
import { propertiesPath } from './constants';
import { CustomFieldCell } from './CustomFieldCell';
import { FIELD_TYPES_OBJECT } from './fieldTypes';
import { useFields } from './useFields';

const EmptyProperties = ({ contentType }: { contentType: FieldContentType }) => (
  <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
    <IconListDetails className="text-muted-foreground" size={64} stroke={1.5} />
    <h3 className="font-semibold text-muted-foreground">No properties found </h3>
    <div className="my-2 flex flex-col items-center justify-center gap-2">
      <p className="text-muted-foreground">Get started by creating your first property.</p>
      <Link to={propertiesPath(contentType)} className={buttonVariants({ size: 'sm' })}>
        Create property
      </Link>
    </div>
  </div>
);

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
  const { sections, loading, error } = useFields(contentType);

  if (error) return <p className="px-2 py-6 text-sm text-destructive">{messageOf(error)}</p>;

  if (loading || !values) return <Spinner area="sm" />;

  if (sections.length === 0) return empty;

  return (
    <div className="flex flex-col gap-2">
      {sections.map(({ group, fields }) => (
        <Collapsible
          key={group?.id ?? 'ungrouped'}
          defaultOpen
          className="group flex flex-col rounded-xl bg-foreground/5 p-1 pt-0"
        >
          <div className="flex h-7 shrink-0 items-center justify-between pr-1">
            <Collapsible.Trigger render={<Button variant="ghost" size="xs" />}>
              <Collapsible.TriggerIcon className="size-3" />
              <span className="font-mono uppercase">{group?.name ?? 'Properties'}</span>
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
        </Collapsible>
      ))}
    </div>
  );
};
