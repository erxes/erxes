import type { FieldContentType, FieldGroup } from '@erxes/core-contract';
import { Button, Sheet } from 'erxes-ui';
import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddPropertyGroup } from '../usePropertyMutations';
import { PropertyGroupForm } from './PropertyGroupForm';

/** "Add Group": the group form in a sheet; `onAdded` gets the new group. */
export const AddPropertyGroup = ({
  contentType,
  onAdded,
  trigger,
}: {
  contentType: FieldContentType;
  onAdded?: (group: FieldGroup) => void;
  trigger?: ReactElement;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useAddPropertyGroup();

  return (
    <Sheet
      open={open}
      onOpenChange={(next, details) => {
        // Escape keeps the form open, so a half-filled group isn't lost.
        if (details.reason === 'escape-key') return details.cancel();
        setOpen(next);
      }}
    >
      <Sheet.Trigger render={trigger ?? <Button variant="outline" />}>
        {trigger ? undefined : t('add-group', 'Add Group')}
      </Sheet.Trigger>
      <Sheet.View className="p-0">
        {open && (
          <PropertyGroupForm
            onSubmit={(data) =>
              mutate(
                {
                  contentType,
                  name: data.name,
                  code: data.code,
                  description: data.description || null,
                },
                {
                  onSuccess: (group) => {
                    setOpen(false);
                    onAdded?.(group);
                  },
                },
              )
            }
            loading={isPending}
            defaultValues={{ name: '', code: '', description: '' }}
            onCancel={() => setOpen(false)}
            contentType={contentType}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};
