import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { useConfirm } from 'erxes-ui';
import { useFieldGroupEdit } from '@/properties/hooks/useFieldGroupEdit';
import { activePropertyState } from '@/properties/states/activePropertyState';
import { useGroupPanelSelection } from '@/properties/hooks/useGroupPanelSelection';
import { useTranslation } from 'react-i18next';
import { IPropertyGroupForm, PropertyGroupForm } from 'ui-modules';

export const PropertyGroupEditSheet = () => {
  const {
    group: activePropertyGroup,
    close,
    loading: groupLoading,
    error,
  } = useGroupPanelSelection(activePropertyState, 'editGroupCode');
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
          close();
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
    <CoreModulePanel
      name={'properties/PropertyGroupEdit'}
      onOpenChange={(open) => !open && close()}
      open={!!activePropertyGroup}
    >
      <CoreModulePanel.View
        loading={groupLoading}
        error={!!error}
        notFound={!groupLoading && !activePropertyGroup}
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        {activePropertyGroup && (
          <PropertyGroupForm
            key={activePropertyGroup._id}
            onSubmit={submitHandler}
            loading={loading}
            defaultValues={{
              name: activePropertyGroup.name,
              code: activePropertyGroup.code,
              isMultiple: !!activePropertyGroup.configs?.isMultiple,
            }}
            onCancel={close}
            locked={!!activePropertyGroup.owner}
            isEdit
            contentType={activePropertyGroup.contentType}
          />
        )}
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
