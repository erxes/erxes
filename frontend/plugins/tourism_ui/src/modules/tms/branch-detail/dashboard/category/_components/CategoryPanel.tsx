import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, Form, useToast } from 'erxes-ui';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PanelFormLayout } from 'ui-modules';
import { TourismPanelLanguageRow } from '@/tms/side-panel/TourismPanelForm';
import { TourismPanelRecordState } from '@/tms/side-panel/TourismPanelLayout';
import { TourismPanelRemoveAction } from '@/tms/side-panel/TourismPanelRemoveAction';
import {
  ITourismPanelViewProps,
  ITourismPanelViews,
  TMS_CATEGORY_CONTENT_TYPE,
} from '@/tms/side-panel/tourismPanelTypes';
import {
  useTourismPanel,
  useTourismPanelBranch,
  useTourismPanelDraft,
  useTourismPanelRouteBranchId,
} from '@/tms/side-panel/useTourismPanel';
import {
  CategoryCreateFormSchema,
  CategoryCreateFormType,
} from '../constants/formSchema';
import { REMOVE_CATEGORY } from '../graphql/mutation';
import { GET_CATEGORIES } from '../graphql/queries';
import { useCategoryLanguage } from '../hooks/useCategoryLanguage';
import { useCreateCategory } from '../hooks/useCreateCategory';
import { useEditCategory } from '../hooks/useEditCategory';
import { ICategory } from '../types/category';
import {
  buildEmptyCategoryTranslations,
  buildTranslationsFromCategory,
  resolveMainLanguageName,
  sanitizeCategoryTranslations,
} from '../utils/translationHelpers';
import {
  CategoryAttachmentField,
  CategoryCodeField,
  CategoryNameField,
  CategoryParentIdField,
} from './CategoryFormFields';

interface CategoryPanelFormProps {
  category?: ICategory;
  branchId?: string;
  branchLanguages: string[];
  mainLanguage?: string;
  onCancel: () => void;
  onCreated?: (categoryId: string) => void;
  onUpdated?: () => void;
}

const CategoryPanelForm = ({
  category,
  branchId,
  branchLanguages,
  mainLanguage,
  onCancel,
  onCreated,
  onUpdated,
}: CategoryPanelFormProps) => {
  const { t } = useTranslation('tourism');
  const { toast } = useToast();
  const { createCategory, loading: creating } = useCreateCategory();
  const { editCategory, loading: updating } = useEditCategory();

  const {
    allLanguages,
    translationLanguages,
    selectedLang,
    setSelectedLang,
    labelSuffix,
    fieldPaths,
  } = useCategoryLanguage({ branchLanguages, mainLanguage });

  const form = useForm<CategoryCreateFormType>({
    resolver: zodResolver(CategoryCreateFormSchema),
    defaultValues: category
      ? {
          name: resolveMainLanguageName(category, mainLanguage),
          code: category.code || '',
          parentId: category.parentId || '',
          attachment: category.attachment ?? undefined,
          translations: buildTranslationsFromCategory(
            category,
            translationLanguages,
          ),
        }
      : {
          name: '',
          code: '',
          parentId: '',
          translations: buildEmptyCategoryTranslations(translationLanguages),
        },
  });

  useFieldArray({
    control: form.control,
    name: 'translations',
  });

  const onInvalid = () => {
    if (!form.getValues('name')?.trim()) {
      toast({
        title: t('error'),
        description: t('enter-main-lang-before-creating'),
        variant: 'destructive',
      });
      setSelectedLang(mainLanguage || allLanguages[0] || '');
    }
  };

  const showError = (error: unknown, fallbackKey: string) =>
    toast({
      title: t('error'),
      description: error instanceof Error ? error.message : t(fallbackKey),
      variant: 'destructive',
    });

  const handleSubmit = async (values: CategoryCreateFormType) => {
    const input = {
      name: values.name,
      code: values.code,
      ...(values.parentId &&
        values.parentId.trim() !== '' && { parentId: values.parentId }),
      ...(branchId && { branchId }),
      ...(values.attachment && { attachment: values.attachment }),
      language: mainLanguage,
      translations: sanitizeCategoryTranslations(values.translations),
    };

    if (category) {
      try {
        await editCategory({ variables: { id: category._id, ...input } });

        toast({
          title: t('success'),
          description: t('category-updated-successfully'),
        });
        onUpdated?.();
      } catch (error) {
        showError(error, 'failed-to-update-category');
      }

      return;
    }

    try {
      const result = await createCategory({ variables: input });

      toast({
        title: t('success'),
        description: t('category-created-successfully'),
      });

      const createdId = result.data?.bmsTourCategoryAdd?._id;

      if (createdId) {
        onCreated?.(createdId);
      }
    } catch (error) {
      showError(error, 'failed-to-create-category');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          handleSubmit,
          category ? undefined : onInvalid,
        )}
        className="flex flex-1 min-h-0 flex-col"
      >
        <PanelFormLayout
          onCancel={onCancel}
          saving={creating || updating}
          saveLabel={category ? t('update') : t('create')}
        >
          <TourismPanelLanguageRow
            languages={allLanguages}
            value={selectedLang}
            onValueChange={setSelectedLang}
          />
          <CategoryNameField
            key={fieldPaths.name}
            control={form.control}
            name={fieldPaths.name}
            labelSuffix={labelSuffix}
          />
          <CategoryCodeField control={form.control} />
          <CategoryParentIdField
            control={form.control}
            branchId={branchId}
            language={selectedLang}
          />
          <CategoryAttachmentField control={form.control} />
        </PanelFormLayout>
      </form>
    </Form>
  );
};

const CategoryPanelNew = () => {
  const { branchId } = useTourismPanelDraft(TMS_CATEGORY_CONTENT_TYPE);
  const { openDetail, cancelDraft } = useTourismPanel(
    TMS_CATEGORY_CONTENT_TYPE,
  );
  const { branch, branchLanguages, mainLanguage, loading } =
    useTourismPanelBranch(branchId);

  return (
    <TourismPanelRecordState
      loading={loading}
      hasRecord={!!branchId && (!!branch || !loading)}
    >
      <CategoryPanelForm
        key={branchId}
        branchId={branchId}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
        onCancel={cancelDraft}
        onCreated={(categoryId) => openDetail(categoryId, { replace: true })}
      />
    </TourismPanelRecordState>
  );
};

const CategoryPanelDetail = ({ contentId }: ITourismPanelViewProps) => {
  const { closePanel } = useTourismPanel(TMS_CATEGORY_CONTENT_TYPE);
  const {
    branch,
    branchId,
    branchLanguages,
    mainLanguage,
    loading: branchLoading,
  } = useTourismPanelBranch();
  const { data, loading } = useQuery<{ bmsTourCategories?: ICategory[] }>(
    GET_CATEGORIES,
    {
      variables: { branchId },
      skip: !branchId,
      fetchPolicy: 'cache-and-network',
    },
  );
  const category = data?.bmsTourCategories?.find(
    (item) => item._id === contentId,
  );

  return (
    <TourismPanelRecordState
      loading={loading || branchLoading}
      hasRecord={!!category && (!!branch || !branchLoading)}
    >
      {category && (
        <CategoryPanelForm
          key={category._id}
          category={category}
          branchId={category.branchId || branchId}
          branchLanguages={branchLanguages}
          mainLanguage={mainLanguage}
          onCancel={closePanel}
          onUpdated={closePanel}
        />
      )}
    </TourismPanelRecordState>
  );
};

const CategoryPanelActions = ({ contentId }: ITourismPanelViewProps) => {
  const { t } = useTranslation('tourism');
  const { toast } = useToast();
  const [deleteCategory, { loading }] = useMutation(REMOVE_CATEGORY, {
    refetchQueries: ['BmsTourCategories'],
  });

  return (
    <TourismPanelRemoveAction
      message={t('confirm-delete-category')}
      loading={loading}
      onRemove={(onCompleted) =>
        deleteCategory({
          variables: { id: contentId },
          onCompleted: () => {
            toast({
              title: t('success'),
              variant: 'success',
              description: t('category-deleted-successfully'),
            });
            onCompleted();
          },
          onError: (error) =>
            toast({
              title: t('error'),
              description: error.message,
              variant: 'destructive',
            }),
        })
      }
    />
  );
};

export const CategoryCreateButton = ({ branchId }: { branchId?: string }) => {
  const { t } = useTranslation('tourism');
  const { openDraft } = useTourismPanel(TMS_CATEGORY_CONTENT_TYPE);

  return (
    <Button onClick={() => openDraft({ branchId })}>
      <IconPlus />
      {t('create-category')}
    </Button>
  );
};

const useCategoryPanelHeading = (contentId: string) => {
  const branchId = useTourismPanelRouteBranchId();
  const { data } = useQuery<{ bmsTourCategories?: ICategory[] }>(
    GET_CATEGORIES,
    { variables: { branchId }, skip: !branchId },
  );

  return {
    name: data?.bmsTourCategories?.find((item) => item._id === contentId)?.name,
  };
};

export const CATEGORY_PANEL: ITourismPanelViews = {
  addLabel: 'create-category',
  editLabel: 'edit-category',
  New: CategoryPanelNew,
  useHeading: useCategoryPanelHeading,
  Detail: CategoryPanelDetail,
  Actions: CategoryPanelActions,
};
