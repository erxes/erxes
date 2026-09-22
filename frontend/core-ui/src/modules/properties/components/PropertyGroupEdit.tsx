import { Sheet, useConfirm } from 'erxes-ui';
import { PropertyGroupForm } from './PropertyGroupForm';
import { useFieldGroupEdit } from '../hooks/useFieldGroupEdit';
import { activePropertyState } from '../states/activePropertyState';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { IPropertyGroupForm } from '../types/Properties';

export const PropertyGroupEditSheet = () => {
  const [activePropertyGroup, setActivePropertyGroup] =
    useAtom(activePropertyState);
  const { editFieldGroup, loading } = useFieldGroupEdit();
  const { confirm } = useConfirm();
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  const submitHandler = ({ isMultiple, ...data }: IPropertyGroupForm) => {
    const save = () =>
      editFieldGroup({
        variables: {
          id: activePropertyGroup?._id,
          ...data,
          configs: { ...activePropertyGroup?.configs, isMultiple },
        },
        onCompleted: () => {
          setActivePropertyGroup(null);
        },
        refetchQueries: ['FieldGroups'],
      });

    if (isMultiple === !!activePropertyGroup?.configs?.isMultiple) {
      return save();
    }

    confirm({
      message: t(
        'confirm-toggle-multiple',
        'Values already filled in for this group will stop showing until you switch this back. Nothing is deleted.',
      ),
    }).then(save);
  };

  return (
    <Sheet
      onOpenChange={() => setActivePropertyGroup(null)}
      open={!!activePropertyGroup}
    >
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        {activePropertyGroup && (
          <PropertyGroupForm
            onSubmit={submitHandler}
            loading={loading}
            defaultValues={{
              name: activePropertyGroup.name,
              code: activePropertyGroup.code,
              isMultiple: !!activePropertyGroup.configs?.isMultiple,
            }}
            onCancel={() => setActivePropertyGroup(null)}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};
