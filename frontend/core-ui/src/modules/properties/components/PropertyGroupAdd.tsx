import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { Button } from 'erxes-ui';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useLocation } from 'react-router-dom';
import {
  Can,
  IPropertyGroupForm,
  PropertyGroupForm,
  propertyGroupSchema,
  useAddPropertyGroup,
} from 'ui-modules';

export const AddPropertyGroup = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { type } = useParams<{ type: string }>();
  const location = useLocation();

  const { addPropertyGroup, loading } = useAddPropertyGroup(type || '');
  const form = useForm<IPropertyGroupForm>({
    resolver: zodResolver(propertyGroupSchema),
    defaultValues: {
      name: '',
      code: '',
      isMultiple: false,
    },
  });
  const [open, setOpen] = useState<boolean>(false);

  const submitHandler: SubmitHandler<IPropertyGroupForm> = (data) => {
    addPropertyGroup({
      variables: {
        name: data.name,
        code: data.code,
        contentType: type,
        configs: { isMultiple: data.isMultiple },
      },
      onCompleted: () => {
        form.reset();
        setOpen(false);
      },
    });
  };

  if (
    location.pathname.includes('add') ||
    location.pathname.split(type || '')[1]?.length > 2
  ) {
    return null;
  }

  return (
    <CoreModulePanel
      requiredPermission="fieldGroupsManage"
      name={'properties/PropertyGroupAdd'}
      onOpenChange={setOpen}
      open={open}
    >
      <Can action="fieldGroupsManage">
        <CoreModulePanel.Trigger asChild>
          <Button variant="outline">{t('add-group', 'Add Group')}</Button>
        </CoreModulePanel.Trigger>
      </Can>
      <CoreModulePanel.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <PropertyGroupForm
          onSubmit={submitHandler}
          loading={loading}
          defaultValues={form.getValues()}
          onCancel={() => setOpen(false)}
          contentType={type || ''}
        />
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
