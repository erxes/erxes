import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CompanyFormType } from '../constants/formSchema';
import {
  Form,
  Input,
  Select,
  Editor,
  Upload,
  MultipleSelector,
  CountryPhoneCodes,
} from 'erxes-ui';
import { SelectCompany, SelectMember } from 'ui-modules';
import { COMPANY_BUSINESS_TYPES, DEFAULT_COMPANY_INDUSTRY_TYPES } from '../constants';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';

const INDUSTRY_OPTIONS = DEFAULT_COMPANY_INDUSTRY_TYPES.filter((i) => i).map((i) => ({
  label: i,
  value: i,
}));

export const CompanyAddGeneralInformationFields = ({
  form,
}: {
  form: UseFormReturn<CompanyFormType>;
}) => {
  const { t } = useTranslation('contact');

  return (
    <div className="space-y-4">
      <Form.Field
        name="avatar"
        control={form.control}
        render={({ field }) => (
          <Form.Item>
            <Form.Control>
              <Upload.Root
                {...field}
                value={field.value || ''}
                onChange={(fileInfo) => {
                  if ('url' in fileInfo) {
                    field.onChange(fileInfo.url);
                  }
                }}
              >
                <Upload.Preview className="rounded-full" />
                <div className="flex flex-col justify-center gap-2">
                  <div className="flex gap-4">
                    <Upload.Button size="sm" variant="outline" type="button">
                      {t('upload', 'Upload')}
                    </Upload.Button>
                    <Upload.RemoveButton
                      size="sm"
                      variant="outline"
                      type="button"
                    />
                  </div>
                  <Form.Description>
                    {t('upload-description', 'Upload an avatar for the company')}
                  </Form.Description>
                </div>
              </Upload.Root>
            </Form.Control>
          </Form.Item>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Form.Field
          control={form.control}
          name="primaryName"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('company.field.primaryName', 'Name')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="code"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('company.field.code', 'Code')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="ownerId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('company.field.owner', 'Owner')}</Form.Label>
              <Form.Control>
                <div className="w-full">
                  <SelectMember.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t('company.field.owner-placeholder')}
                  />
                </div>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="parentCompanyId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('company.field.parentCompanyId', 'Parent Company')}
              </Form.Label>
              <Form.Control>
                <SelectCompany
                  mode="single"
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="email"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('company.field.email', 'Email')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="phone"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('company.field.phone', 'Phone')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="website"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('company.field.website', 'Website')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="industry"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('company.field.industry', 'Industries')}
              </Form.Label>
              <Form.Control>
                <MultipleSelector
                  defaultOptions={INDUSTRY_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t('company.field.industry-placeholder')}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="location"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('company.field.location', 'Headquarters country')}
              </Form.Label>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value placeholder="Select country" />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {CountryPhoneCodes.map((country) => (
                    <Select.Item key={country.code} value={country.name}>
                      <span className="mr-2">{country.flag}</span>
                      {country.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="businessType"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('company.field.businessType', 'Business Type')}
              </Form.Label>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {COMPANY_BUSINESS_TYPES.filter((t) => t).map(
                    (type, index) => (
                      <Select.Item key={index} value={type}>
                        {type}
                      </Select.Item>
                    )
                  )}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="size"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('company.field.size', 'Size')}</Form.Label>
              <Form.Control>
                <Input type="number" {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="plan"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('company.field.plan', 'Plan')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('company.field.description', 'Description')}</Form.Label>
            <Form.Control>
              <Editor
                initialContent={field.value}
                onChange={field.onChange}
                scope={ContactsHotKeyScope.CompanyAddSheet}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
