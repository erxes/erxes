import { Button, Form, Input, Select } from 'erxes-ui';

import { useEBarimtConfig } from '@/ebarimt/settings/ebarimt-config/hooks/useEBarimtConfig';
import { useEffect } from 'react';

export const EBarimtMainSettingsForm = () => {
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
    if (isFieldGroupEmpty) return 'Choose Field Group first';
    if (isFieldGroupBasic && billTypeValue === 'description')
      return 'Description';
    return 'Select bill type';
  })();



  return (
    <Form {...form}>
      <form
        className="h-full w-full mx-auto max-w-2xl px-9 py-5 flex flex-col gap-8"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h1 className="text-lg font-semibold">Ebarimt configs</h1>

        <Form.Field
          name="CompanyName"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label className="font-sans normal-case text-foreground text-sm font-medium leading-none">
                Company name
              </Form.Label>
              <Form.Message />
              <Form.Control>
                <Input
                  type="text"
                  placeholder="Enter company name"
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
                Ebarimt url
              </Form.Label>
              <Form.Message />
              <Form.Control>
                <Input
                  type="text"
                  placeholder="Enter ebarimt url"
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
                Check taxpayer url
              </Form.Label>
              <Form.Message />
              <Form.Control>
                <Input
                  type="text"
                  placeholder="Enter check taxpayer url"
                  className="h-8"
                  {...field}
                />
              </Form.Control>
            </Form.Item>
          )}
        />

        <h1 className="text-lg font-semibold">Deals ebarimt billType config</h1>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <Form.Field
              control={form.control}
              name="FieldGroup"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Field Group</Form.Label>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFieldGroupChange(value);
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select a field group" />
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
                  <Form.Label>Bill Type Chooser</Form.Label>
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
                  <Form.Label>RegNo or TINNo Input</Form.Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value
                        placeholder={
                          isFieldGroupEmpty
                            ? 'Choose Field Group first'
                            : 'Select field type'
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
                  <Form.Label>Company Name Response</Form.Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value
                        placeholder={
                          isFieldGroupEmpty
                            ? 'Choose Field Group first'
                            : 'Select field type'
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
            {isUpdating ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
