import type { Customer, CustomerState } from '@erxes/core-contract';
import {
  IconBriefcase,
  IconBuilding,
  IconBuildingSkyscraper,
  IconCake,
  IconCode,
  IconGenderMale,
  IconLabelFilled,
  IconMail,
  IconNotes,
  IconPhone,
  IconTrash,
  IconUserCircle,
  IconUserQuestion,
  IconX,
} from '@tabler/icons-react';
import {
  Avatar,
  Button,
  Command,
  PopoverScoped,
  RecordTableInlineCell,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { api, messageOf } from '~/lib/api';
import { useSession } from '~/modules/auth/session';
import { CustomFieldCell } from '~/modules/properties/CustomFieldCell';
import { useFields } from '~/modules/properties/useFields';
import { DetailPanel, DetailRow, DetailSection } from '../components/DetailPanel';
import { LinkPicker } from '../components/LinkPicker';
import {
  BirthDateCell,
  EmailsCell,
  NameCell,
  OwnerCell,
  PhonesCell,
  SexCell,
  TagsCell,
  TextCell,
  useCustomerFieldsSave,
} from './customersColumns';
import {
  CUSTOMER_SHEET_PARAM,
  customerName,
  useCustomer,
  useCustomerCompanies,
  useCustomerCompanyLink,
  useCustomerEdit,
  useCustomersRemove,
} from './useCustomers';

const STATES: { value: CustomerState; label: string }[] = [
  { value: 'customer', label: 'Customer' },
  { value: 'lead', label: 'Lead' },
];

const StateCell = ({ customer }: { customer: Customer }) => {
  const edit = useCustomerEdit();
  const [open, setOpen] = useState(false);

  return (
    <PopoverScoped scope={`core-customer-detail.${customer.id}.state`} open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger>
        {STATES.find((state) => state.value === customer.state)?.label}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-40 p-0">
        <Command>
          <Command.List className="p-1">
            {STATES.map((state) => (
              <Command.Item
                key={state.value}
                value={state.value}
                onSelect={() => {
                  setOpen(false);
                  if (state.value !== customer.state) edit.mutate({ id: customer.id, state: state.value });
                }}
              >
                {state.label}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

const CustomerCompanies = ({ customer }: { customer: Customer }) => {
  const companies = useCustomerCompanies(customer.id);
  const link = useCustomerCompanyLink();
  const linked = companies.data?.data ?? [];

  return (
    <DetailSection
      title="Companies"
      action={
        <LinkPicker
          label="Add"
          queryKey="companies"
          excludeIds={linked.map((company) => company.id)}
          search={async (search) =>
            (await api.companies.list({ limit: 20, search: search || undefined })).data.map(
              (company) => ({ id: company.id, label: company.primaryName, detail: company.website }),
            )
          }
          onPick={(companyId) => link.mutate({ customerId: customer.id, companyId, linked: true })}
        />
      }
    >
      {!linked.length && <p className="py-1 text-sm text-muted-foreground">Not linked to a company</p>}
      {linked.map((company) => (
        <div key={company.id} className="group flex h-8 items-center gap-2 rounded-sm px-2 hover:bg-accent">
          <IconBuilding className="size-4 text-muted-foreground" />
          <span className="flex-1 truncate text-sm">{company.primaryName}</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            aria-label={`Remove ${company.primaryName}`}
            onClick={() => link.mutate({ customerId: customer.id, companyId: company.id, linked: false })}
          >
            <IconX className="size-3.5" />
          </Button>
        </div>
      ))}
    </DetailSection>
  );
};

const CustomerProperties = ({ customer }: { customer: Customer }) => {
  const { fields } = useFields('customer');
  const save = useCustomerFieldsSave();

  if (!fields.length) {
    return null;
  }

  return (
    <DetailSection title="Properties">
      {fields.map((field) => (
        <DetailRow key={field.id} label={field.label}>
          <CustomFieldCell
            field={field}
            scope={`core-customer-detail.${customer.id}.${field.id}`}
            value={customer.customFields[field.id]}
            onSave={(value) => save(customer.id, { [field.id]: value })}
          />
        </DetailRow>
      ))}
    </DetailSection>
  );
};

/** `?customerId=<id>`: the customer beside the list, every field editable in place. */
export const CustomerDetail = () => {
  const [openId, setOpenId] = useQueryState<string>(CUSTOMER_SHEET_PARAM);
  const id = openId && openId !== 'new' ? openId : null;
  const customer = useCustomer(id);
  const remove = useCustomersRemove();
  const { confirm } = useConfirm();
  const { user } = useSession();
  const data = customer.data;
  const name = data ? customerName(data) || data.primaryEmail || data.primaryPhone || 'Unnamed' : '';
  const close = () => setOpenId(null);

  return (
    <DetailPanel
      open={!!id}
      onClose={close}
      loading={customer.isPending}
      error={customer.isError ? messageOf(customer.error) : null}
      title={name}
      subtitle={data?.primaryEmail ?? data?.primaryPhone}
      avatar={
        <Avatar size="xl">
          {data?.avatarUrl && <Avatar.Image src={data.avatarUrl} />}
          <Avatar.Fallback>{name.charAt(0).toUpperCase() || '?'}</Avatar.Fallback>
        </Avatar>
      }
      actions={
        data &&
        user.role !== 'member' && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete customer"
            onClick={() =>
              confirm({
                message: `Delete ${name}?`,
                options: { okLabel: 'Delete', variants: { ok: 'destructive' } },
              }).then(() => remove.mutate([data.id], { onSuccess: close }))
            }
          >
            <IconTrash />
          </Button>
        )
      }
    >
      {data && (
        <>
          <DetailSection title="Details">
            <DetailRow label="Name" icon={IconLabelFilled}>
              <NameCell customer={data} />
            </DetailRow>
            <DetailRow label="Emails" icon={IconMail}>
              <EmailsCell customer={data} />
            </DetailRow>
            <DetailRow label="Phones" icon={IconPhone}>
              <PhonesCell customer={data} />
            </DetailRow>
            <DetailRow label="Type" icon={IconUserQuestion}>
              <StateCell customer={data} />
            </DetailRow>
            <DetailRow label="Owner" icon={IconUserCircle}>
              <OwnerCell customer={data} />
            </DetailRow>
            <DetailRow label="Sex" icon={IconGenderMale}>
              <SexCell customer={data} />
            </DetailRow>
            <DetailRow label="Birthday" icon={IconCake}>
              <BirthDateCell customer={data} />
            </DetailRow>
            <DetailRow label="Position" icon={IconBriefcase}>
              <TextCell customer={data} field="position" />
            </DetailRow>
            <DetailRow label="Department" icon={IconBuildingSkyscraper}>
              <TextCell customer={data} field="department" />
            </DetailRow>
            <DetailRow label="Code" icon={IconCode}>
              <TextCell customer={data} field="code" />
            </DetailRow>
            <DetailRow label="Description" icon={IconNotes}>
              <TextCell customer={data} field="description" />
            </DetailRow>
          </DetailSection>
          <DetailSection title="Tags">
            <TagsCell customer={data} />
          </DetailSection>
          <CustomerProperties customer={data} />
          <CustomerCompanies customer={data} />
          <p className="px-5 py-4 text-xs text-muted-foreground">
            Added {new Date(data.createdAt).toLocaleString()} · updated {new Date(data.updatedAt).toLocaleString()}
          </p>
        </>
      )}
    </DetailPanel>
  );
};
