import { useId } from 'react';
import { TBranchForm } from '../../types/branch';
import { ControllerRenderProps, Path, useFormContext } from 'react-hook-form';
import { Collapsible, Form, Input, Skeleton, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectBranches, SelectMember } from 'ui-modules';
import { PhoneInput } from 'erxes-ui/modules/record-field/meta-inputs/components/PhoneInput';
import { IconChevronDown } from '@tabler/icons-react';
import {
  TitleField,
  CodeField,
  DeletedStatusField,
} from '../StructureFormFields';

export const BranchForm = () => {
  const { t } = useTranslation('settings');
  const { control, formState } = useFormContext<TBranchForm>();
  // show the status field only when the record was originally deleted, so the
  // field stays visible while the user switches it back to active
  const wasDeleted = formState.defaultValues?.status === 'deleted';

  return (
    <div className="grid grid-cols-2 gap-2">
      <TitleField control={control} />
      <CodeField control={control} />
      <Form.Field
        control={control}
        name="address"
        render={({ field }) => (
          <Form.Item className="col-span-2">
            <Form.Label>{field.name}</Form.Label>
            <Form.Control>
              <Textarea
                {...field}
                value={field.value ?? ''}
                placeholder={t('branch.address-placeholder', 'Provide an address')}
              />
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
            <Form.Label>{t('supervisor', 'Supervisor')}</Form.Label>
            <SelectMember.FormItem
              value={field.value ?? ''}
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
            <Form.Label>{t('parent', 'Parent')}</Form.Label>
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
            <Form.Label>{t('team-members', 'Team members')}</Form.Label>
            <SelectMember.FormItem
              value={field.value ?? []}
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
            <Form.Label>{t('phone-number', 'Phone number')}</Form.Label>
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
          <Form.Label>{t('links', 'Links')}</Form.Label>
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
                placeholder={t('branch.radius-placeholder', 'Radius')}
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
            <Form.Label>{t('latitude', 'Latitude')}</Form.Label>
            <Form.Control>
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder={t('branch.latitude-placeholder', 'Latitude')}
              />
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
            <Form.Label>{t('longitude', 'Longitude')}</Form.Label>
            <Form.Control>
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder={t('branch.longitude-placeholder', 'Longitude')}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      {wasDeleted && <DeletedStatusField control={control} />}
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
    <div className="not-first:*:mt-2">
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
