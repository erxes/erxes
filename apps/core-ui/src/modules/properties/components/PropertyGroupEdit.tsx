import { Sheet } from 'erxes-ui';
import { useAtom } from 'jotai';
import { activePropertyGroupState } from '../states';
import { useEditPropertyGroup } from '../usePropertyMutations';
import { PropertyGroupForm } from './PropertyGroupForm';

/** The group form for the group picked with "Edit". */
export const PropertyGroupEditSheet = () => {
  const [group, setGroup] = useAtom(activePropertyGroupState);
  const { mutate, isPending } = useEditPropertyGroup();
  const close = () => setGroup(null);

  return (
    <Sheet open={!!group} onOpenChange={(open) => !open && close()}>
      <Sheet.View className="p-0">
        {group && (
          <PropertyGroupForm
            key={group.id}
            isEdit
            onSubmit={(data) =>
              mutate(
                {
                  id: group.id,
                  name: data.name,
                  code: data.code,
                  description: data.description || null,
                },
                { onSuccess: close },
              )
            }
            loading={isPending}
            defaultValues={{
              name: group.name,
              code: group.code,
              description: group.description ?? '',
            }}
            onCancel={close}
            contentType={group.contentType}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};
