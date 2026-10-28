import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { PanelField } from 'ui-modules';
import { AccountCategoryForm } from '@/settings/account/account-categories/components/AccountCategoryForm';
import { SelectAccountCategory } from '@/settings/account/account-categories/components/SelectAccountCategory';
import { ACCOUNT_CATEGORY_DEFAULT_VALUES } from '@/settings/account/account-categories/constants/accountCategoryDefaultValues';
import { accountCategorySchema } from '@/settings/account/account-categories/constants/accountCategorySchema';
import { useAccountCategoriesRemove } from '@/settings/account/account-categories/hooks/useAccountCategoriesRemove';
import { useAccountCategoryAdd } from '@/settings/account/account-categories/hooks/useAccountCategoryAdd';
import { useAccountCategoryDetail } from '@/settings/account/account-categories/hooks/useAccountCategoryDetail';
import { useAccountCategoryEdit } from '@/settings/account/account-categories/hooks/useAccountCategoryEdit';
import {
  IAccountCategory,
  TAccountCategoryForm,
} from '@/settings/account/account-categories/types/AccountCategory';
import { SettingsPanelRemoveAction } from '@/settings/components/panel/SettingsPanelActions';
import {
  SettingsPanelDescriptionField,
  SettingsPanelTextField,
} from '@/settings/components/panel/SettingsPanelFields';
import {
  ISettingsPanelViewProps,
  ISettingsPanelViews,
  SettingsPanelDetailLayout,
} from '@/settings/components/panel/SettingsPanelLayout';
import {
  ACCOUNT_CATEGORY_CONTENT_TYPE,
  SETTINGS_PANEL_CELL_CLASS_NAME,
} from '@/settings/constants/settingsPanel';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

const SCOPE = 'side-panel-account-category';

type TAccountCategoryPanelChange = Partial<
  Omit<TAccountCategoryForm, 'parentId'>
> & { parentId?: string | null };

const AccountCategoryPanelNew = () => {
  const { openDetail, cancelDraft } = useSettingsPanel(
    ACCOUNT_CATEGORY_CONTENT_TYPE,
  );
  const { addAccountCategory, loading } = useAccountCategoryAdd();
  const form = useForm<TAccountCategoryForm>({
    resolver: zodResolver(accountCategorySchema),
    defaultValues: ACCOUNT_CATEGORY_DEFAULT_VALUES,
  });

  const handleSubmit = (data: TAccountCategoryForm) => {
    if (loading) {
      return;
    }

    addAccountCategory({
      variables: { ...data },
      onCompleted: ({ accountCategoriesAdd }) => {
        if (accountCategoriesAdd?._id) {
          openDetail(accountCategoriesAdd._id, { replace: true });
        }
      },
    });
  };

  return (
    <AccountCategoryForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={cancelDraft}
      saving={loading}
    />
  );
};

const AccountCategoryPanelActions = ({
  contentId,
}: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const { removeAccountCategories, loading } = useAccountCategoriesRemove();

  return (
    <SettingsPanelRemoveAction
      message={t('are-you-sure-delete-this-account-category')}
      loading={loading}
      onRemove={(onCompleted) =>
        removeAccountCategories({
          variables: { _id: contentId },
          onError: (error) => {
            toast({
              title: t('error'),
              description: error.message,
              variant: 'destructive',
            });
          },
          onCompleted: () => {
            toast({
              title: t('success'),
              description: t('account-category-deleted-successfully'),
            });
            onCompleted();
          },
        })
      }
    />
  );
};

const AccountCategoryPanelDetail = ({ contentId }: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const { accountCategoryDetail: category, loading } =
    useAccountCategoryDetail(contentId);
  const { editAccountCategory } = useAccountCategoryEdit();

  const save = (
    current: IAccountCategory,
    fields: TAccountCategoryPanelChange,
  ) =>
    editAccountCategory({
      variables: {
        _id: current._id,
        name: current.name ?? '',
        code: current.code ?? '',
        parentId: current.parentId,
        description: current.description,
        ...fields,
      },
      refetchQueries: [
        'accountingAccountCategories',
        'accountingAccountCategoryDetail',
      ],
    });

  return (
    <SettingsPanelDetailLayout loading={loading} hasRecord={!!category}>
      {category && (
        <>
          <PanelField label={t('name')}>
            <SettingsPanelTextField
              scope={`${SCOPE}.name`}
              value={category.name || ''}
              placeholder={t('name')}
              onSave={(name) => name.trim() && save(category, { name })}
            />
          </PanelField>
          <PanelField label={t('code')}>
            <SettingsPanelTextField
              scope={`${SCOPE}.code`}
              value={category.code || ''}
              placeholder={t('code')}
              onSave={(code) => code.trim() && save(category, { code })}
            />
          </PanelField>
          <PanelField label={t('parent')}>
            <SelectAccountCategory
              recordId={`${SCOPE}.parent`}
              selected={category.parentId || undefined}
              exclude={[category._id]}
              nullable
              variant="ghost"
              hideChevron
              className={SETTINGS_PANEL_CELL_CLASS_NAME}
              onSelect={(parentId) =>
                parentId !== category.parentId && save(category, { parentId })
              }
            />
          </PanelField>
          <SettingsPanelDescriptionField
            key={category._id}
            value={category.description || ''}
            onSave={(description) => save(category, { description })}
          />
        </>
      )}
    </SettingsPanelDetailLayout>
  );
};

export const ACCOUNT_CATEGORY_PANEL: ISettingsPanelViews = {
  addLabel: 'add-account-category',
  editLabel: 'edit-account-category',
  New: AccountCategoryPanelNew,
  Actions: AccountCategoryPanelActions,
  Detail: AccountCategoryPanelDetail,
};
