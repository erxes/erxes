import { Button, Form, Input, Select } from 'erxes-ui';
import { useEBarimtConfig } from '@/ebarimt/settings/ebarimt-config/hooks/useEBarimtConfig';
import { useTranslation } from 'react-i18next';

export const EBarimtMainSettingsForm = () => {
  const { t } = useTranslation('mongolian');
  const {
    form,
    handleUpdate,
    selectedFieldGroup,
    fieldGroupOptions,
    getDependentOptions,
    handleFieldGroupChange,
    isUpdating,
  } = useEBarimtConfig();

  const onSubmit = async (formData: any) => {
    await handleUpdate(formData);
  };

  const isFieldGroupEmpty = selectedFieldGroup === 'empty';
  const isFieldGroupBasic = selectedFieldGroup === 'basic';

  const billTypeValue = form.watch('BillTypeChooser');

  const billTypePlaceholder = (() => {
    if (isFieldGroupEmpty) return t('choose-field-group-first', 'Choose Field Group first');
    if (isFieldGroupBasic && billTypeValue === 'description')
      return t('description', 'Description');
    return t('select-bill-type', 'Select bill type');
  })();

  return (
    <Form {...form}>
      <form
        className="h-full w-full mx-auto max-w-2xl px-9 py-5 flex flex-col gap-8"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h1 className="text-lg font-semibold">{t('ebarimt-configs', 'Ebarimt configs')}</h1>

        <Form.Field
          name="CompanyName"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label className="font-sans normal-case text-foreground text-sm font-medium leading-none">
                {t('company-name', 'Company name')}
              </Form.Label>
              <Form.Message />
              <Form.Control>
                <Input
                  type="text"
                  placeholder={t('enter-company-name', 'Enter company name')}
                  className="h-8"
                  {...field}
                />
              </Form.Control>
            </Form.Item>
          )}
        />

        <Form.Field
          name="EbarimtUrl"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label className="font-sans normal-case text-foreground text-sm font-medium leading-none">
                {t('ebarimt-url', 'Ebarimt url')}
              </Form.Label>
              <Form.Message />
              <Form.Control>
                <Input
                  type="text"
                  placeholder={t('enter-ebarimt-url', 'Enter ebarimt url')}
                  className="h-8"
                  {...field}
                />
              </Form.Control>
            </Form.Item>
          )}
        />

        <Form.Field
          name="CheckTaxpayerUrl"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label className="font-sans normal-case text-foreground text-sm font-medium leading-none">
                {t('check-taxpayer-url', 'Check taxpayer url')}
              </Form.Label>
              <Form.Message />
              <Form.Control>
                <Input
                  type="text"
                  placeholder={t('enter-check-taxpayer-url', 'Enter check taxpayer url')}
                  className="h-8"
                  {...field}
                />
              </Form.Control>
            </Form.Item>
          )}
        />

        <h1 className="text-lg font-semibold">{t('deals-ebarimt-billtype-config', 'Deals ebarimt billType config')}</h1>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <Form.Field
              control={form.control}
              name="FieldGroup"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('field-group', 'Field Group')}</Form.Label>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFieldGroupChange(value);
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder={t('select-a-field-group', 'Select a field group')} />
                    </Select.Trigger>
                    <Select.Content>
                      {fieldGroupOptions.map((group) => (
                        <Select.Item key={group.value} value={group.value}>
                          {group.label}
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
              name="BillTypeChooser"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('bill-type-chooser', 'Bill Type Chooser')}</Form.Label>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder={billTypePlaceholder} />
                    </Select.Trigger>
                    <Select.Content>
                      {getDependentOptions('BillTypeChooser').map((option) => (
                        <Select.Item key={option.value} value={option.value}>
                          {option.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>

                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>

          <div className="space-y-4">
            <Form.Field
              control={form.control}
              name="RegNoInput"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('regno-or-tinno-input', 'RegNo or TINNo Input')}</Form.Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value
                        placeholder={
                          isFieldGroupEmpty
                            ? t('choose-field-group-first', 'Choose Field Group first')
                            : t('select-field-type', 'Select field type')
                        }
                      />
                    </Select.Trigger>
                    <Select.Content>
                      {getDependentOptions('RegNoInput').map((option) => (
                        <Select.Item key={option.value} value={option.value}>
                          {option.label}
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
              name="CompanyNameResponse"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('company-name-response', 'Company Name Response')}</Form.Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value
                        placeholder={
                          isFieldGroupEmpty
                            ? t('choose-field-group-first', 'Choose Field Group first')
                            : t('select-field-type', 'Select field type')
                        }
                      />
                    </Select.Trigger>
                    <Select.Content>
                      {getDependentOptions('CompanyNameResponse').map(
                        (option) => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ),
                      )}
                    </Select.Content>
                  </Select>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </div>

        <div className="text-right">
          <Button
            className="justify-self-end flex-none"
            type="submit"
            disabled={isUpdating}
          >
            {isUpdating ? t('saving', 'Saving...') : t('save', 'Save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
