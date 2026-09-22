import { Form, Input } from 'erxes-ui';
import { TFunction } from 'i18next';
import { Control } from 'react-hook-form';
import { HELP_CENTER_HEADER_FIELDS } from '@/helpcenter/constants';
import { IHelpCenterConfigInput } from '@/helpcenter/types';

export function HelpCenterHeaderFields({
  control,
  t,
}: Readonly<{
  control: Control<IHelpCenterConfigInput>;
  t: TFunction;
}>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {HELP_CENTER_HEADER_FIELDS.map((field) => (
        <Form.Field
          key={field.name}
          control={control}
          name={field.name}
          render={({ field: controlled }) => (
            <Form.Item>
              <Form.Label className="font-normal text-muted-foreground">
                {t(field.key, field.label)}
              </Form.Label>
              <Form.Control>
                <Input
                  {...controlled}
                  className="h-8"
                  placeholder={field.placeholder}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      ))}
    </div>
  );
}
