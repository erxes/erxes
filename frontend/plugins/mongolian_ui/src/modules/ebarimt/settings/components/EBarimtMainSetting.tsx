import { Button, Checkbox, cn, Form, Input, Select } from 'erxes-ui';
import { useForm, UseFormReturn, useWatch } from 'react-hook-form';
import {
  FIELD_GROUP_TYPES,
  FILE_SYSTEM_TYPES,
} from '../stage-in-return-ebarimt-config/constants/ebarimtData';

const DEFAULT_VALUES = {
  CompanyName: '',
  EbarimtUrl: '',
  CheckTaxpayerUrl: '',
  FieldGroup: '',
  FieldGroup2: '',
  FieldGroup3: '',
  FieldGroup4: '',
};

export const MainSettingsForm = () => {
  const form = useForm({
    defaultValues: DEFAULT_VALUES,
  });

  return (
    <Form {...form}>
      <form className="h-full w-full mx-auto max-w-2xl px-9 py-5 flex flex-col gap-8">
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
                  <Form.Label>Field group </Form.Label>
                  <Form.Control>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <Select.Trigger>
                        <Select.Value placeholder={'Empty'} />
                      </Select.Trigger>
                      <Select.Content>
                        {FIELD_GROUP_TYPES.map((type) => (
                          <Select.Item key={type.value} value={type.value}>
                            {type.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="FieldGroup2"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Bill Type Chooser</Form.Label>
                  <Form.Control>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <Select.Trigger>
                        <Select.Value placeholder={'Empty'} />
                      </Select.Trigger>
                      <Select.Content>
                        {FILE_SYSTEM_TYPES.map((type) => (
                          <Select.Item key={type.value} value={type.value}>
                            {type.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
          <div className="space-y-4">
            <Form.Field
              control={form.control}
              name="FieldGroup3"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>RegNo or TINNo input</Form.Label>
                  <Form.Control>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <Select.Trigger>
                        <Select.Value placeholder={'Empty'} />
                      </Select.Trigger>
                      <Select.Content>
                        {FILE_SYSTEM_TYPES.map((type) => (
                          <Select.Item key={type.value} value={type.value}>
                            {type.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="FieldGroup4"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Company name response</Form.Label>
                  <Form.Control>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <Select.Trigger>
                        <Select.Value placeholder={'Empty'} />
                      </Select.Trigger>
                      <Select.Content>
                        {FILE_SYSTEM_TYPES.map((type) => (
                          <Select.Item key={type.value} value={type.value}>
                            {type.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </div>

        <div className="text-right">
          <Button className="justify-self-end flex-none" type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};

export const VatFormFields = ({ form }: { form: UseFormReturn }) => {
  const { HasVat } = useWatch({ control: form.control });

  return (
    <>
      <Form.Field
        control={form.control}
        name="HasVat"
        render={({ field }) => (
          <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
            <Form.Control>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Form.Control>
            <Form.Label variant="peer">Has VAT</Form.Label>
          </Form.Item>
        )}
      />
    </>
  );
};

export const CtaxFormFields = ({ form }: { form: UseFormReturn }) => {
  const { HasCtax } = useWatch({ control: form.control });
  return (
    <>
      <Form.Field
        control={form.control}
        name="HasCtax"
        render={({ field }) => (
          <Form.Item className="col-span-2 flex items-center gap-2 space-y-0 mt-7">
            <Form.Control>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Form.Control>
            <Form.Label variant="peer">Has Ctax</Form.Label>
          </Form.Item>
        )}
      />
      {HasCtax && (
        <Form.Field
          control={form.control}
          name="CtaxPayableAccount"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Ctax account payable</Form.Label>
            </Form.Item>
          )}
        />
      )}
    </>
  );
};
