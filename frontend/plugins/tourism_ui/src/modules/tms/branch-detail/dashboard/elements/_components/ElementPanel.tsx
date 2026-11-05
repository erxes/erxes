import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, Form, useToast } from 'erxes-ui';
import { PanelFormLayout } from 'ui-modules';
import { TourismPanelLanguageRow } from '@/tms/side-panel/TourismPanelForm';
import { TourismPanelRecordState } from '@/tms/side-panel/TourismPanelLayout';
import { TourismPanelRemoveAction } from '@/tms/side-panel/TourismPanelRemoveAction';
import {
  ITourismPanelViewProps,
  ITourismPanelViews,
  TMS_ELEMENT_CONTENT_TYPE,
} from '@/tms/side-panel/tourismPanelTypes';
import {
  useTourismPanel,
  useTourismPanelBranch,
  useTourismPanelDraft,
} from '@/tms/side-panel/useTourismPanel';
import {
  ElementCreateFormSchema,
  ElementCreateFormType,
} from '../constants/formSchema';
import { GET_ELEMENT_DETAIL } from '../graphql/queries';
import { useCreateElement } from '../hooks/useCreateElement';
import { useEditElement } from '../hooks/useEditElement';
import { useElementLanguage } from '../hooks/useElementLanguage';
import { useRemoveElements } from '../hooks/useRemoveElements';
import { IElement } from '../types/element';
import {
  buildEmptyTranslations,
  buildTranslationsFromElement,
  resolveMainLanguageName,
  sanitizeTranslations,
} from '../utils/translationHelpers';
import {
  ElementPanelCategoriesField,
  ElementPanelCostField,
  ElementPanelDurationField,
  ElementPanelNameField,
  ElementPanelNoteField,
  ElementPanelStartTimeField,
} from './ElementPanelFields';

interface ElementPanelFormProps {
  element?: IElement;
  branchId: string;
  branchLanguages?: string[];
  mainLanguage?: string;
  onCancel: () => void;
  onCreated?: (elementId: string) => void;
  onUpdated?: () => void;
}

const getElementFormValues = (
  element: IElement | undefined,
  mainLanguage: string | undefined,
  translationLanguages: string[],
): ElementCreateFormType => ({
  name: element ? resolveMainLanguageName(element, mainLanguage) : '',
  note: element?.note || '',
  startTime: element?.startTime || '',
  duration: element?.duration || 0,
  cost: element?.cost || 0,
  categories: element?.categories || [],
  translations: element
    ? buildTranslationsFromElement(element, translationLanguages)
    : buildEmptyTranslations(translationLanguages),
});

const ElementPanelForm = ({
  element,
  branchId,
  branchLanguages,
  mainLanguage,
  onCancel,
  onCreated,
  onUpdated,
}: ElementPanelFormProps) => {
  const { t } = useTranslation('tourism');
  const { toast } = useToast();
  const isEditing = !!element;
  const { createElement, loading: creating } = useCreateElement();
  const { editElement, loading: updating } = useEditElement();

  const {
    allLanguages,
    translationLanguages,
    selectedLang,
    setSelectedLang,
    labelSuffix,
    currencySymbol,
    fieldPaths,
  } = useElementLanguage({ branchLanguages, mainLanguage });

  const primaryLanguage = mainLanguage ?? allLanguages[0] ?? '';

  const form = useForm<ElementCreateFormType>({
    resolver: zodResolver(ElementCreateFormSchema),
    defaultValues: getElementFormValues(
      element,
      mainLanguage,
      translationLanguages,
    ),
  });

  useFieldArray({ control: form.control, name: 'translations' });

  useEffect(() => {
    form.reset(
      getElementFormValues(element, mainLanguage, translationLanguages),
    );
  }, [form, element, mainLanguage, translationLanguages]);

  const onInvalid = () => {
    if (!form.getValues('name')?.trim()) {
      toast({
        title: t('error'),
        description: t('enter-main-lang-before-creating'),
        variant: 'destructive',
      });
      setSelectedLang(primaryLanguage);
    }
  };

  const handleSubmit = async (values: ElementCreateFormType) => {
    const input = {
      name: values.name,
      note: values.note,
      startTime: values.startTime,
      duration: values.duration,
      cost: values.cost,
      categories: values.categories,
      quick: false,
      language: primaryLanguage,
      translations: sanitizeTranslations(values.translations),
    };

    if (element) {
      try {
        await editElement({ variables: { id: element._id, ...input } });
        toast({
          title: t('success'),
          description: t('element-updated-successfully'),
        });
        onUpdated?.();
      } catch (error) {
        toast({
          title: t('error'),
          description:
            error instanceof Error
              ? error.message
              : t('failed-to-update-element'),
          variant: 'destructive',
        });
      }
      return;
    }

    if (!branchId) {
      toast({
        title: t('error'),
        description: t('branch-required'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await createElement({
        variables: { branchId, ...input },
      });
      toast({
        title: t('success'),
        description: t('element-created-successfully'),
      });
      const createdId = result.data?.bmsElementAdd?._id;

      if (createdId) {
        onCreated?.(createdId);
      }
    } catch (error) {
      toast({
        title: t('error'),
        description:
          error instanceof Error
            ? error.message
            : t('failed-to-create-element'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(handleSubmit, onInvalid)(e);
        }}
        className="flex flex-1 min-h-0 flex-col"
      >
        <PanelFormLayout
          onCancel={onCancel}
          saving={creating || updating}
          saveLabel={isEditing ? t('update') : t('create')}
        >
          <TourismPanelLanguageRow
            languages={allLanguages}
            value={selectedLang}
            onValueChange={setSelectedLang}
          />
          <div key={selectedLang} className="flex flex-col gap-1">
            <ElementPanelNameField
              key={fieldPaths.name}
              control={form.control}
              name={fieldPaths.name}
              labelSuffix={labelSuffix}
            />
            <ElementPanelStartTimeField control={form.control} />
            <ElementPanelDurationField control={form.control} />
            <ElementPanelCostField
              key={fieldPaths.cost}
              control={form.control}
              name={fieldPaths.cost}
              currencySymbol={currencySymbol}
            />
            <ElementPanelCategoriesField control={form.control} />
            <ElementPanelNoteField
              key={fieldPaths.note}
              control={form.control}
              name={fieldPaths.note}
              labelSuffix={labelSuffix}
            />
          </div>
        </PanelFormLayout>
      </form>
    </Form>
  );
};

const ElementPanelNew = () => {
  const { branchId } = useTourismPanelDraft(TMS_ELEMENT_CONTENT_TYPE);
  const { branchLanguages, mainLanguage, loading } =
    useTourismPanelBranch(branchId);
  const { openDetail, cancelDraft } = useTourismPanel(TMS_ELEMENT_CONTENT_TYPE);

  return (
    <TourismPanelRecordState loading={loading} hasRecord={!loading}>
      <ElementPanelForm
        key={branchId}
        branchId={branchId}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
        onCancel={cancelDraft}
        onCreated={(elementId) => openDetail(elementId, { replace: true })}
      />
    </TourismPanelRecordState>
  );
};

const ElementPanelDetail = ({ contentId }: ITourismPanelViewProps) => {
  const { closePanel } = useTourismPanel(TMS_ELEMENT_CONTENT_TYPE);
  const { data, loading } = useQuery<{ bmsElementDetail: IElement }>(
    GET_ELEMENT_DETAIL,
    {
      variables: { id: contentId },
      fetchPolicy: 'network-only',
    },
  );
  const element = data?.bmsElementDetail;
  const {
    branchId,
    branchLanguages,
    mainLanguage,
    loading: branchLoading,
  } = useTourismPanelBranch(element?.branchId);

  return (
    <TourismPanelRecordState
      loading={loading || branchLoading}
      hasRecord={!!element}
    >
      {element && (
        <ElementPanelForm
          key={element._id}
          element={element}
          branchId={branchId}
          branchLanguages={branchLanguages}
          mainLanguage={mainLanguage}
          onCancel={closePanel}
          onUpdated={closePanel}
        />
      )}
    </TourismPanelRecordState>
  );
};

const ElementPanelActions = ({ contentId }: ITourismPanelViewProps) => {
  const { t } = useTranslation('tourism');
  const { toast } = useToast();
  const { removeElements, loading } = useRemoveElements();

  return (
    <TourismPanelRemoveAction
      message={t('confirm-delete-element')}
      loading={loading}
      onRemove={(onCompleted) =>
        removeElements([contentId])
          .then(() => {
            toast({
              title: t('success'),
              variant: 'success',
              description: t('element-deleted-successfully'),
            });
            onCompleted();
          })
          .catch((error: unknown) =>
            toast({
              title: t('error'),
              description: error instanceof Error ? error.message : '',
              variant: 'destructive',
            }),
          )
      }
    />
  );
};

export const ElementCreateButton = ({ branchId }: { branchId: string }) => {
  const { t } = useTranslation('tourism');
  const { openDraft } = useTourismPanel(TMS_ELEMENT_CONTENT_TYPE);

  return (
    <Button type="button" onClick={() => openDraft({ branchId })}>
      <IconPlus />
      {t('create-element')}
    </Button>
  );
};

export const ELEMENT_PANEL: ITourismPanelViews = {
  addLabel: 'create-element',
  editLabel: 'edit-element',
  New: ElementPanelNew,
  Detail: ElementPanelDetail,
  Actions: ElementPanelActions,
};
