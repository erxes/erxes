import type { ContentType, FieldGroup } from '@erxes/core-contract';
import { Button, Sheet } from 'erxes-ui';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddPropertyGroup } from '../usePropertyMutations';
import { PropertyGroupForm } from './PropertyGroupForm';

/** "Add Group": the group form in a sheet; `onAdded` gets the new group. */
export const AddPropertyGroup = ({
  contentType,
  onAdded,
  trigger,
}: {
  contentType: ContentType;
  onAdded?: (group: FieldGroup) => void;
  trigger?: ReactNode;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useAddPropertyGroup();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        {trigger ?? <Button variant="outline">{t('add-group', 'Add Group')}</Button>}
      </Sheet.Trigger>
      <Sheet.View className="p-0" onEscapeKeyDown={(event) => event.preventDefault()}>
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
