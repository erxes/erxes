import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Can,
  IPropertyContentScope,
  IPropertyGroupForm,
  PropertyGroupForm,
  useAddPropertyGroup,
} from 'ui-modules';

const EMPTY_GROUP: IPropertyGroupForm = {
  name: '',
  code: '',
  isMultiple: false,
};

export const AddPropertyGroup = ({
  contentType,
  contentTypeId,
}: IPropertyContentScope) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { addPropertyGroup, loading } = useAddPropertyGroup(
    contentType,
    contentTypeId,
  );
  const [open, setOpen] = useState<boolean>(false);

  const submitHandler = async ({
    name,
    code,
    isMultiple,
  }: IPropertyGroupForm) => {
    const { data } = await addPropertyGroup({
      variables: {
        name,
        code,
        contentType,
        contentTypeId,
        configs: { isMultiple },
      },
    });

    if (data) {
      setOpen(false);
    }
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <Can action="fieldGroupsManage">
        <Sheet.Trigger asChild>
          <Button variant="outline">{t('add-group', 'Add Group')}</Button>
        </Sheet.Trigger>
      </Can>
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <PropertyGroupForm
          onSubmit={submitHandler}
          loading={loading}
          defaultValues={EMPTY_GROUP}
          onCancel={() => setOpen(false)}
          contentType={contentType}
        />
      </Sheet.View>
    </Sheet>
  );
};
