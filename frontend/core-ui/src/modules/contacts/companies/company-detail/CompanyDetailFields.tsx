import { useCompanyDetailWithQuery } from '@/contacts/companies/hooks/useCompanyDetailWithQuery';
import { CompanyAddGeneralInformationFields } from '@/contacts/companies/components/CompanyAddGeneralInformationFields';
import { companyFormSchema, CompanyFormType } from '@/contacts/companies/constants/formSchema';
import { DataListItem } from '@/contacts/components/ContactDataListItem';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Combobox, Form, Label, Switch, useToast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TagsSelect, useCompaniesEdit } from 'ui-modules';

export const CompanyDetailFields = () => {
  const { companyDetail } = useCompanyDetailWithQuery();
  const {
    tagIds,
    _id,
    ownerId,
    code,
    primaryEmail,
    primaryPhone,
    isSubscribed,
    description,
    location,
    industry,
    website,
    size,
    businessType,
    parentCompany,
    avatar,
    primaryName,
  } = companyDetail;
  const { companiesEdit } = useCompaniesEdit();
  const { toast } = useToast();
  const { t } = useTranslation('contact');

  const industryValue = industry
    ? industry.map((i: string) => ({ label: i, value: i }))
    : [];

  const form = useForm<CompanyFormType>({
    resolver: zodResolver(companyFormSchema),
    values: {
      primaryName: primaryName || '',
      email: primaryEmail || '',
      phone: primaryPhone || '',
      website: website || '',
      industry: industryValue,
      description: description || '',
      code: code || '',
      avatar: avatar || '',
      location: location || '',
      parentCompanyId: parentCompany?._id || '',
      ownerId: ownerId || '',
      businessType: businessType || '',
      size: size || 0,
    },
  });

  const onSubmit = (data: CompanyFormType) => {
    const { phone, email, industry, ...rest } = data;
    companiesEdit({
      variables: {
        _id,
        ...rest,
        primaryPhone: phone,
        primaryEmail: email,
        industry: industry?.map((i) => i.value),
      },
      onCompleted: () => {
        toast({ title: t('saved') || 'Saved', variant: 'success' });
      },
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="space-y-6 py-8">
      <CompanyDetailSelectTag tagIds={tagIds} companyId={_id} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-8">
          <CompanyAddGeneralInformationFields form={form} />

          <DataListItem label={t('subscribed') || 'Subscribed'}>
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

          <div className="flex justify-end">
            <Button type="submit">{t('save') || 'Save'}</Button>
          </div>
        </form>
      </Form>
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

  const { t } = useTranslation('contact', { keyPrefix: 'customer.detail' });

  return (
    <fieldset className="space-y-2 px-8">
      <Label asChild>
        <legend>{t('tags')}</legend>
      </Label>{' '}
      <TagsSelect.Provider
        type="core:company"
        targetIds={[companyId]}
        value={tagIdsValue}
        onValueChange={(value) => {
          setTagIdsValue(value as string[]);
        }}
        mode="multiple"
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
      >
        <div className="gap-2 flex flex-wrap w-full items-center">
          <TagsSelect.SelectedList />
          <TagsSelect.Trigger variant="ICON" />
          <Combobox.Content>
            <TagsSelect.Content />
          </Combobox.Content>
        </div>
      </TagsSelect.Provider>
    </fieldset>
  );
};
