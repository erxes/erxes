import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { useConfirm } from 'erxes-ui';
import { useFieldGroupEdit } from '@/properties/hooks/useFieldGroupEdit';
import { activePropertyState } from '@/properties/states/activePropertyState';
import { useGroupPanelSelection } from '@/properties/hooks/useGroupPanelSelection';
import { useTranslation } from 'react-i18next';
import {
  PropertyGroupForm,
  RecordSidePanel,
  IPropertyGroupForm,
} from 'ui-modules';
export const PropertyGroupEditSheet = () => {
  const { t: panelT } = useTranslation('settings', {
    keyPrefix: 'properties',
  });
  const {
    group: activePropertyGroup,
    open,
    close,
    loading: groupLoading,
    error,
  } = useGroupPanelSelection(activePropertyState, 'editGroupCode');
  const { editFieldGroup, loading } = useFieldGroupEdit();
  const { confirm } = useConfirm();
  const { t } = useTranslation('settings', {
    keyPrefix: 'properties',
  });
  const submitHandler = ({ isMultiple, ...data }: IPropertyGroupForm) => {
    const save = () =>
      editFieldGroup({
        variables: {
          id: activePropertyGroup?._id,
          ...data,
          configs: {
            ...activePropertyGroup?.configs,
            isMultiple,
          },
        },
        onCompleted: () => {
          if (!pagePanel.isCurrent()) return;
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
  const pagePanel = usePagePanel({
    expandable: false,
    identity: activePropertyGroup?._id || 'new',
    name: 'properties/PropertyGroupEdit',
    onOpenChange: (open) => !open && close(),
    open: open,
  });
  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded &&
      pagePanel.allowed &&
      !groupLoading &&
      !error &&
      !(!groupLoading && !activePropertyGroup) ? (
        <>
          {activePropertyGroup && (
            <>
              <RecordSidePanel.Header
                title={panelT('edit-group', 'Edit Group')}
                {...pagePanel.headerProps}
              />
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
                layout="record"
              />
            </>
          )}
        </>
      ) : (
        <PagePanelStatus
          entry={pagePanel}
          loading={groupLoading}
          error={!!error}
        />
      )}
    </div>,
    pagePanel,
  );
};
