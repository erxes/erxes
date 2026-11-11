import type { Company } from '@erxes/core-contract';
import {
  IconBriefcase,
  IconCode,
  IconBuildingFactory2,
  IconLabelFilled,
  IconMail,
  IconNotes,
  IconPhone,
  IconTrash,
  IconUser,
  IconUserCircle,
  IconUsers,
  IconWorld,
  IconX,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Button, useConfirm, useQueryState } from 'erxes-ui';
import { api, messageOf } from '~/lib/api';
import { useSession } from '~/modules/auth/session';
import { CustomFieldCell } from '~/modules/properties/CustomFieldCell';
import { useFields } from '~/modules/properties/useFields';
import { DetailPanel, DetailRow, DetailSection } from '../components/DetailPanel';
import { LinkPicker } from '../components/LinkPicker';
import { customerName, useCustomerCompanyLink } from '../customers/useCustomers';
import {
  CompanyEmailsCell,
  CompanyNameCell,
  CompanyOwnerCell,
  CompanyPhonesCell,
  CompanySizeCell,
  CompanyTagsCell,
  CompanyTextCell,
  useCompanyFieldsSave,
} from './companiesColumns';
import { COMPANIES_KEY, COMPANY_SHEET_PARAM, useCompaniesRemove, useCompany } from './useCompanies';

const CompanyCustomers = ({ company }: { company: Company }) => {
  const customers = useQuery({
    queryKey: [...COMPANIES_KEY, 'customers', company.id],
    queryFn: () => api.customers.list({ companyId: company.id, limit: 50 }),
  });
  const link = useCustomerCompanyLink();
  const linked = customers.data?.data ?? [];
  const [, setCustomerId] = useQueryState<string>('customerId');

  return (
    <DetailSection
      title={`Customers${customers.data ? ` · ${customers.data.totalCount}` : ''}`}
      action={
        <LinkPicker
          label="Add"
          queryKey="customers"
          excludeIds={linked.map((customer) => customer.id)}
          search={async (search) =>
            (await api.customers.list({ limit: 20, search: search || undefined })).data.map(
              (customer) => ({
                id: customer.id,
                label: customerName(customer) || customer.primaryEmail || customer.primaryPhone || 'Unnamed',
                detail: customer.primaryEmail,
              }),
            )
          }
          onPick={(customerId) => link.mutate({ customerId, companyId: company.id, linked: true })}
        />
      }
    >
      {!linked.length && <p className="py-1 text-sm text-muted-foreground">No customers yet</p>}
      {linked.map((customer) => {
        const name = customerName(customer) || customer.primaryEmail || 'Unnamed';

        return (
          <div key={customer.id} className="group flex h-8 items-center gap-2 rounded-sm px-2 hover:bg-accent">
            <IconUser className="size-4 text-muted-foreground" />
            <button
              type="button"
              className="flex-1 truncate text-left text-sm hover:underline"
              onClick={() => setCustomerId(customer.id)}
            >
              {name}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              aria-label={`Remove ${name}`}
              onClick={() => link.mutate({ customerId: customer.id, companyId: company.id, linked: false })}
            >
              <IconX className="size-3.5" />
            </Button>
          </div>
        );
      })}
    </DetailSection>
  );
};

const CompanyProperties = ({ company }: { company: Company }) => {
  const { fields } = useFields('company');
  const save = useCompanyFieldsSave();

  if (!fields.length) {
    return null;
  }

  return (
    <DetailSection title="Properties">
      {fields.map((field) => (
        <DetailRow key={field.id} label={field.label}>
          <CustomFieldCell
            field={field}
            scope={`core-company-detail.${company.id}.${field.id}`}
            value={company.customFields[field.id]}
            onSave={(value) => save(company.id, { [field.id]: value })}
          />
        </DetailRow>
      ))}
    </DetailSection>
  );
};

/** `?companyId=<id>`: the company beside the list, every field editable in place. */
export const CompanyDetail = () => {
  const [openId, setOpenId] = useQueryState<string>(COMPANY_SHEET_PARAM);
  const id = openId && openId !== 'new' ? openId : null;
  const company = useCompany(id);
  const remove = useCompaniesRemove();
  const { confirm } = useConfirm();
  const { user } = useSession();
  const data = company.data;
  const close = () => setOpenId(null);

  return (
    <DetailPanel
      open={!!id}
      onClose={close}
      loading={company.isPending}
      error={company.isError ? messageOf(company.error) : null}
      title={data?.primaryName ?? ''}
      subtitle={data?.website ?? data?.primaryEmail}
      avatar={
        <Avatar size="xl" className="rounded-md">
          {data?.avatarUrl && <Avatar.Image src={data.avatarUrl} />}
          <Avatar.Fallback className="rounded-md">{data?.primaryName.charAt(0).toUpperCase() ?? '?'}</Avatar.Fallback>
        </Avatar>
      }
      actions={
        data &&
        user.role !== 'member' && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete company"
            onClick={() =>
              confirm({
                message: `Delete ${data.primaryName}?`,
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
              <CompanyNameCell company={data} />
            </DetailRow>
            <DetailRow label="Emails" icon={IconMail}>
              <CompanyEmailsCell company={data} />
            </DetailRow>
            <DetailRow label="Phones" icon={IconPhone}>
              <CompanyPhonesCell company={data} />
            </DetailRow>
            <DetailRow label="Website" icon={IconWorld}>
              <CompanyTextCell company={data} field="website" />
            </DetailRow>
            <DetailRow label="Owner" icon={IconUserCircle}>
              <CompanyOwnerCell company={data} />
            </DetailRow>
            <DetailRow label="Industry" icon={IconBuildingFactory2}>
              <CompanyTextCell company={data} field="industry" />
            </DetailRow>
            <DetailRow label="Business type" icon={IconBriefcase}>
              <CompanyTextCell company={data} field="businessType" />
            </DetailRow>
            <DetailRow label="Employees" icon={IconUsers}>
              <CompanySizeCell company={data} />
            </DetailRow>
            <DetailRow label="Code" icon={IconCode}>
              <CompanyTextCell company={data} field="code" />
            </DetailRow>
            <DetailRow label="Description" icon={IconNotes}>
              <CompanyTextCell company={data} field="description" />
            </DetailRow>
          </DetailSection>
          <DetailSection title="Tags">
            <CompanyTagsCell company={data} />
          </DetailSection>
          <CompanyProperties company={data} />
          <CompanyCustomers company={data} />
          {data.names.length > 1 && (
            <p className="px-5 pt-4 text-xs text-muted-foreground">Also known as {data.names.slice(1).join(', ')}</p>
          )}
          <p className="px-5 py-4 text-xs text-muted-foreground">
            Added {new Date(data.createdAt).toLocaleString()} · updated {new Date(data.updatedAt).toLocaleString()}
          </p>
        </>
      )}
    </DetailPanel>
  );
};
