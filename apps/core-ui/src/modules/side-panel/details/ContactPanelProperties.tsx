import type { CustomValue } from '@erxes/core-contract';
import { IconListDetails } from '@tabler/icons-react';
import { Button, Collapsible, ScrollArea, Spinner } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { messageOf } from '~/lib/api';
import { useCompany, useCompanyEdit } from '~/modules/contacts/companies/useCompanies';
import { useCustomer, useCustomerEdit } from '~/modules/contacts/customers/useCustomers';
import { CustomFieldCell } from '~/modules/properties/CustomFieldCell';
import { FIELD_TYPES_OBJECT } from '~/modules/properties/fieldTypes';
import { useFields } from '~/modules/properties/useFields';
import { PanelField } from '../PanelField';
import { CONTACT_SETTINGS } from '~/modules/contacts/settings/paths';

const EmptyProperties = ({ kind }: { kind: 'customer' | 'company' }) => {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
      <IconListDetails className="text-muted-foreground" size={64} stroke={1.5} />
      <h3 className="font-semibold text-muted-foreground">No properties found </h3>
      <div className="my-2 flex flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">Get started by creating your first property.</p>
        <Button size="sm" asChild>
          <Link to={`${CONTACT_SETTINGS.properties}/${kind}`}>Create property</Link>
        </Button>
      </div>
    </div>
  );
};

/**
 * A contact's custom fields, as their own panel tab (old FieldsInDetail,
 * `bare`): one collapsible card per field group, in group order.
 */
const ContactProperties = ({
  kind,
  id,
  values,
  onSave,
}: {
  kind: 'customer' | 'company';
  id: string;
  values: Record<string, CustomValue> | undefined;
  onSave: (patch: Record<string, CustomValue | null>) => void;
}) => {
  const { sections, loading, error } = useFields(kind);

  if (error) return <p className="px-2 py-6 text-sm text-destructive">{messageOf(error)}</p>;

  if (loading || !values) return <Spinner containerClassName="py-6" />;

  if (sections.length === 0) return <EmptyProperties kind={kind} />;

  return (
    <div className="flex flex-col gap-2">
      {sections.map(({ group, fields }) => (
        <Collapsible
          key={group?.id ?? 'ungrouped'}
          defaultOpen
          className="group flex flex-col rounded-xl bg-foreground/5 p-1 pt-0"
        >
          <div className="flex h-7 shrink-0 items-center justify-between pr-1">
            <Collapsible.Trigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1.5 px-1 font-mono text-xs font-medium uppercase"
              >
                <Collapsible.TriggerIcon className="size-3" />
                {group?.name ?? 'Properties'}
              </Button>
            </Collapsible.Trigger>
          </div>
          <Collapsible.Content>
            <div className="flex flex-col gap-1 rounded-lg bg-background p-3 shadow-sm">
              {fields.map((field) => (
                <PanelField
                  key={field.id}
                  icon={FIELD_TYPES_OBJECT[field.type].icon}
                  label={field.label}
                >
                  <CustomFieldCell
                    field={field}
                    scope={`side-panel-${kind}.${id}.${field.id}`}
                    value={values[field.id]}
                    onSave={(value) => onSave({ [field.id]: value })}
                  />
                </PanelField>
              ))}
            </div>
          </Collapsible.Content>
        </Collapsible>
      ))}
    </div>
  );
};

export const CustomerPanelProperties = ({ customerId }: { customerId: string }) => {
  const { data } = useCustomer(customerId);
  const edit = useCustomerEdit();

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="p-3">
        <ContactProperties
          kind="customer"
          id={customerId}
          values={data?.customFields}
          onSave={(customFields) => edit.mutate({ id: customerId, customFields })}
        />
      </div>
    </ScrollArea>
  );
};

export const CompanyPanelProperties = ({ companyId }: { companyId: string }) => {
  const { data } = useCompany(companyId);
  const edit = useCompanyEdit();

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="p-3">
        <ContactProperties
          kind="company"
          id={companyId}
          values={data?.customFields}
          onSave={(customFields) => edit.mutate({ id: companyId, customFields })}
        />
      </div>
    </ScrollArea>
  );
};
