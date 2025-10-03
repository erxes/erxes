import { useCompanyDetailWithQuery } from '@/contacts/companies/hooks/useCompanyDetailWithQuery';
import { useEffect, useState } from 'react';
import {
  CompanyEmails,
  CompanyOwner,
  CompanyPhones,
  SelectTags,
  useCompaniesEdit,
} from 'ui-modules';
import { Combobox, Label, Switch, Textarea } from 'erxes-ui';
import { DataListItem } from '@/contacts/components/ContactsDetail';
import { CompanyTextField } from '@/contacts/companies/company-detail/CompanyTextField';

export const CompanyDetailFields = () => {
  const { companyDetail } = useCompanyDetailWithQuery();
  const {
    tagIds,
    _id,
    ownerId,
    code,
    primaryEmail,
    emails,
    emailValidationStatus,
    primaryPhone,
    phones,
    phoneValidationStatus,
    isSubscribed,
    description,
  } = companyDetail;
  const { companiesEdit } = useCompaniesEdit();
  return (
    <div className="space-y-6 py-8">
      <CompanyDetailSelectTag tagIds={tagIds} companyId={_id} />
      <fieldset className="px-8 space-y-2">
        <Label asChild>
          <legend>Owner</legend>
        </Label>
        <div className="inline-flex">
          <CompanyOwner _id={_id} ownerId={ownerId} />
        </div>
      </fieldset>
      <div className="px-8 font-medium flex gap-5 flex-col">
        <div className="grid grid-cols-2 gap-5 col-span-5">
          <DataListItem label="Code">
            <CompanyTextField
              value={code || ''}
              placeholder="Add Code"
              field="code"
              _id={_id}
            />
          </DataListItem>
          <DataListItem label="Emails">
            <CompanyEmails
              _id={_id}
              primaryEmail={primaryEmail || ''}
              emails={emails || []}
              emailValidationStatus={emailValidationStatus || 'valid'}
              Trigger={(props) => <Combobox.TriggerBase {...props} />}
            />
          </DataListItem>
          <DataListItem label="phones">
            <CompanyPhones
              _id={_id}
              primaryPhone={primaryPhone || ''}
              phones={phones || []}
              phoneValidationStatus={phoneValidationStatus || 'valid'}
              Trigger={Combobox.TriggerBase}
            />
          </DataListItem>
        </div>
        <DataListItem label="Subscribed">
          <Switch
            checked={isSubscribed === 'Yes'}
            onCheckedChange={(checked) => {
              companiesEdit({
                variables: {
                  _id,
                  isSubscribed: checked ? 'Yes' : 'No',
                },
              });
            }}
          />
        </DataListItem>
        <DataListItem label="Description">
          <Textarea
            value={description || ''}
            onChange={(e) => {
              companiesEdit({
                variables: {
                  _id,
                  description: e.target.value,
                },
              });
            }}
          />
        </DataListItem>
      </div>
    </div>
  );
};

const CompanyDetailSelectTag = ({
  tagIds,
  companyId,
}: {
  tagIds: string[];
  companyId: string;
}) => {
  const [tagIdsValue, setTagIdsValue] = useState<string[]>(tagIds);

  useEffect(() => {
    if (tagIdsValue !== tagIds) {
      setTagIdsValue(tagIds);
    }
  }, [tagIds]);

  return (
    <fieldset className="space-y-2 px-8">
      <Label asChild>
        <legend>Tags</legend>
      </Label>
      <SelectTags.Detail
        tagType="core:company"
        targetIds={[companyId]}
        value={tagIdsValue}
        onValueChange={(value) => {
          setTagIdsValue(value as string[]);
        }}
        options={(newSelectedTagIds) => ({
          update: (cache) => {
            cache.modify({
              id: cache.identify({
                __typename: 'Company',
                _id: companyId,
              }),
              fields: { tagIds: () => newSelectedTagIds },
              optimistic: true,
            });
          },
          onError() {
            setTagIdsValue(tagIds);
          },
        })}
      />
    </fieldset>
  );
};
