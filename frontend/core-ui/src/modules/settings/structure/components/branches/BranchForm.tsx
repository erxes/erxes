import { useId } from 'react';
import { TBranchForm } from '../../types/branch';
import { ControllerRenderProps, Path, useFormContext } from 'react-hook-form';
import { Collapsible, Form, Input, Skeleton, Textarea } from 'erxes-ui';
import { SelectBranches, SelectMember } from 'ui-modules';
import { PhoneInput } from 'erxes-ui/modules/record-field/meta-inputs/components/PhoneInput';
import { IconChevronDown } from '@tabler/icons-react';

export const BranchForm = () => {
  const { control } = useFormContext<TBranchForm>();

  return (
    <div className="grid grid-cols-2 gap-2">
      <Form.Field
        control={control}
        name="title"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{field.name}</Form.Label>
            <Form.Control>
              <Input {...field} placeholder="Title" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="code"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{field.name}</Form.Label>
            <Form.Control>
              <Input {...field} placeholder="Code" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="address"
        render={({ field }) => (
          <Form.Item className="col-span-2">
            <Form.Label>{field.name}</Form.Label>
            <Form.Control>
              <Textarea {...field} placeholder="Provide an address" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="supervisorId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{'Supervisor'}</Form.Label>
            <SelectMember.FormItem
              value={field.value}
              onValueChange={field.onChange}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="parentId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{'Parent'}</Form.Label>
            <SelectBranches.FormItem
              value={field.value as string}
              onValueChange={field.onChange}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="userIds"
        render={({ field }) => (
          <Form.Item className="col-span-2">
            <Form.Label>{'Team members'}</Form.Label>
            <SelectMember.FormItem
              value={field.value}
              onValueChange={field.onChange}
              mode="multiple"
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="phoneNumber"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{'Phone number'}</Form.Label>
            <Form.Control>
              <PhoneInput {...field} value={field.value as string} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="email"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{field.name}</Form.Label>
            <Form.Control>
              <Input
                {...field}
                value={field.value as string}
                type="email"
                placeholder="example@erxes.io"
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Collapsible className="col-span-2">
        <Collapsible.Trigger className="flex items-center justify-between w-full py-3">
          <Form.Label>Links</Form.Label>
          <IconChevronDown size={16} className="text-accent-foreground" />
        </Collapsible.Trigger>
        <Collapsible.Content>
          <LinkFields />
        </Collapsible.Content>
      </Collapsible>
      <Form.Field
        control={control}
        name="radius"
        render={({ field }) => (
          <Form.Item className="col-span-2">
            <Form.Label>{field.name}</Form.Label>
            <Form.Control>
              <Input
                value={field.value as number}
                onChange={(e) =>
                  field.onChange(
                    e.currentTarget.value === ''
                      ? 0
                      : Number(e.currentTarget.value),
                  )
                }
                inputMode="numeric"
                placeholder="Radius"
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="coordinate.latitude"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{'latitude'}</Form.Label>
            <Form.Control>
              <Input {...field} placeholder="Latitude" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="coordinate.longitude"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{'longitude'}</Form.Label>
            <Form.Control>
              <Input {...field} placeholder="Longitude" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      {/* <Form.Field
        control={control}
        name="image"
        render={({ field }) => (
          <Form.Item className="col-span-2">
            <Form.Label>{'image'}</Form.Label>
            <Form.Control>
              <Upload.Root
                {...field}
                value={field.value?.url as string}
                onChange={(value: any) => field.onChange(value?.url)}
              >
                <Upload.Preview />
                <Upload.RemoveButton />
              </Upload.Root>
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      /> */}
    </div>
  );
};

const LinkFields = () => {
  const { control } = useFormContext<TBranchForm>();
  return (
    <div className="col-span-2 grid grid-cols-2 gap-2">
      {['website', 'facebook', 'whatsapp', 'twitter', 'youtube'].map((link) => (
        <Form.Field
          control={control}
          name={`links.${link}` as Path<TBranchForm>}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{link}</Form.Label>
              <Form.Control>
                <LinkField field={field} link={link} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      ))}
    </div>
  );
};

type LinkFieldProps = {
  field: ControllerRenderProps<TBranchForm, any>;
  link: string;
};

const LinkField = ({ field, link }: LinkFieldProps) => {
  const id = useId();
  return (
    <div className="*:not-first:mt-2">
      <div className="relative">
        <Input
          id={id}
          className="peer ps-16"
          {...field}
          value={field.value as string}
          placeholder={`${link}.com`}
        />
        <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">
          https://
        </span>
      </div>
    </div>
  );
};
