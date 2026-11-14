import { zodResolver } from '@hookform/resolvers/zod';
import { ColorPicker, Form, Input, useToast } from 'erxes-ui';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PanelFormLayout } from 'ui-modules';
import {
  TOURISM_PANEL_INPUT_CLASS_NAME,
  TourismPanelFormField,
  TourismPanelLanguageRow,
} from '@/tms/side-panel/TourismPanelForm';
import { TourismPanelRecordState } from '@/tms/side-panel/TourismPanelLayout';
import {
  ITourismPanelViewProps,
  ITourismPanelViews,
  TMS_ITINERARY_CONTENT_TYPE,
  TMS_ITINERARY_DUPLICATE_CONTENT_TYPE,
} from '@/tms/side-panel/tourismPanelTypes';
import {
  useTourismPanel,
  useTourismPanelBranch,
} from '@/tms/side-panel/useTourismPanel';
import {
  ItineraryCreateFormSchema,
  ItineraryCreateFormType,
} from '../constants/formSchema';
import { useCreateItinerary } from '../hooks/useCreateItinerary';
import { useItineraryDetail } from '../hooks/useItineraryDetail';
import { useItineraryLanguage } from '../hooks/useItineraryLanguage';
import { IItinerary } from '../types/itinerary';
import {
  buildTranslationsFromItinerary,
  sanitizeTranslations,
} from '../utils/translationHelpers';

const duplicateSuffix = ' (copy)';

const getPrimaryItineraryTranslation = (
  itinerary: IItinerary,
  primaryLanguage?: string,
) => itinerary.translations?.find((t) => t.language === primaryLanguage);

const toElementInput = ({
  elementId,
  orderOfDay,
}: {
  elementId?: string;
  orderOfDay?: number;
}) => ({ elementId, orderOfDay });

const getPrimaryGroupDays = (
  itinerary: IItinerary,
  primaryLanguage?: string,
) => {
  const primaryTranslation = getPrimaryItineraryTranslation(
    itinerary,
    primaryLanguage,
  );
  const primaryGroupDayMap = new Map(
    (primaryTranslation?.groupDays || []).map((groupDay) => [
      groupDay.day,
      groupDay,
    ]),
  );

  return itinerary.groupDays?.map((day) => {
    const translatedDay = day.day ? primaryGroupDayMap.get(day.day) : undefined;

    return {
      day: day.day,
      title: translatedDay?.title ?? day.title,
      content: translatedDay?.content ?? day.content,
      elements: day.elements?.map(toElementInput),
      elementsQuick: day.elementsQuick?.map(toElementInput),
      images: day.images,
    };
  });
};

const buildDuplicateName = (value?: string) =>
  value ? `${value}${duplicateSuffix}` : '';

const buildDuplicateTranslationDefaults = (
  itinerary: IItinerary,
  translationLanguages: string[],
) =>
  (buildTranslationsFromItinerary(itinerary, translationLanguages) ?? []).map(
    (translation) => ({
      ...translation,
      name: buildDuplicateName(translation.name),
    }),
  );

const ItineraryDuplicateForm = ({
  itinerary,
  branchId,
  branchLanguages,
  mainLanguage,
  onCancel,
  onDuplicated,
}: {
  itinerary: IItinerary;
  branchId?: string;
  branchLanguages: string[];
  mainLanguage?: string;
  onCancel: () => void;
  onDuplicated: (itineraryId?: string) => void;
}) => {
  const { t } = useTranslation('tourism');
  const { toast } = useToast();
  const { createItinerary, loading } = useCreateItinerary();
  const {
    allLanguages,
    translationLanguages,
    selectedLang,
    setSelectedLang,
    labelSuffix,
    fieldPaths,
  } = useItineraryLanguage({ branchLanguages, mainLanguage });

  const primaryLanguage =
    mainLanguage ?? itinerary.language ?? allLanguages[0] ?? '';
  const primaryTranslation = getPrimaryItineraryTranslation(
    itinerary,
    primaryLanguage,
  );

  const form = useForm<ItineraryCreateFormType>({
    resolver: zodResolver(ItineraryCreateFormSchema),
    defaultValues: {
      name: buildDuplicateName(primaryTranslation?.name || itinerary.name),
      color: itinerary.color || '#4F46E5',
      translations: buildDuplicateTranslationDefaults(
        itinerary,
        translationLanguages,
      ),
    },
  });

  useFieldArray({
    control: form.control,
    name: 'translations',
  });

  const handleInvalid = () => {
    if (!form.getValues('name')?.trim()) {
      setSelectedLang(primaryLanguage);
    }
  };

  const handleSubmit = (values: ItineraryCreateFormType) => {
    const duplicateTranslations = sanitizeTranslations(values.translations);

    createItinerary({
      variables: {
        branchId: branchId || itinerary.branchId,
        language: primaryLanguage || undefined,
        name: values.name,
        duration: itinerary.duration,
        color: values.color,
        images: itinerary.images,
        content: primaryTranslation?.content ?? itinerary.content,
        totalCost: itinerary.totalCost,
        guideCost: primaryTranslation?.guideCost ?? itinerary.guideCost,
        driverCost: primaryTranslation?.driverCost ?? itinerary.driverCost,
        foodCost: primaryTranslation?.foodCost ?? itinerary.foodCost,
        gasCost: primaryTranslation?.gasCost ?? itinerary.gasCost,
        personCost: itinerary.personCost,
        guideCostExtra:
          primaryTranslation?.guideCostExtra ?? itinerary.guideCostExtra,
        groupDays: getPrimaryGroupDays(itinerary, primaryLanguage),
        translations: duplicateTranslations?.length
          ? duplicateTranslations
          : undefined,
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          variant: 'success',
          description: t('itinerary-duplicated-successfully'),
        });
        onDuplicated(data.bmsItineraryAdd?._id);
      },
      onError: (error: unknown) => {
        toast({
          title: t('error'),
          description:
            error instanceof Error
              ? error.message
              : t('failed-to-duplicate-itinerary'),
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
        className="flex flex-1 min-h-0 flex-col"
      >
        <PanelFormLayout
          onCancel={onCancel}
          saving={loading}
          saveLabel={loading ? t('duplicating') : t('duplicate')}
        >
          <TourismPanelLanguageRow
            languages={allLanguages}
            value={selectedLang}
            onValueChange={setSelectedLang}
          />
          <TourismPanelFormField
            key={fieldPaths.name}
            control={form.control}
            name={fieldPaths.name}
            required
            label={
              <>
                {t('name')}
                <span className="text-primary">{labelSuffix}</span>
              </>
            }
            render={(field) => (
              <Input
                placeholder={t('itinerary-name')}
                className={TOURISM_PANEL_INPUT_CLASS_NAME}
                {...field}
                value={field.value || ''}
              />
            )}
          />
          <TourismPanelFormField
            control={form.control}
            name="color"
            label={t('color')}
            render={(field) => (
              <ColorPicker
                value={field.value}
                onValueChange={(value: string) => field.onChange(value)}
                className="w-24"
              />
            )}
          />
        </PanelFormLayout>
      </form>
    </Form>
  );
};

const ItineraryDuplicatePanelDetail = ({
  contentId,
}: ITourismPanelViewProps) => {
  const { cancelDraft, closePanel } = useTourismPanel(
    TMS_ITINERARY_DUPLICATE_CONTENT_TYPE,
  );
  const { openDetail } = useTourismPanel(TMS_ITINERARY_CONTENT_TYPE);
  const {
    branch,
    branchId,
    branchLanguages,
    mainLanguage,
    loading: branchLoading,
  } = useTourismPanelBranch();
  const { itinerary, loading } = useItineraryDetail(contentId);

  return (
    <TourismPanelRecordState
      loading={loading || branchLoading}
      hasRecord={!!itinerary && (!!branch || !branchLoading)}
    >
      {itinerary && (
        <ItineraryDuplicateForm
          key={`${itinerary._id}-${mainLanguage ?? ''}`}
          itinerary={itinerary}
          branchId={itinerary.branchId || branchId}
          branchLanguages={branchLanguages}
          mainLanguage={mainLanguage}
          onCancel={cancelDraft}
          onDuplicated={(itineraryId) =>
            itineraryId
              ? openDetail(itineraryId, { replace: true })
              : closePanel()
          }
        />
      )}
    </TourismPanelRecordState>
  );
};

export const ITINERARY_DUPLICATE_PANEL: ITourismPanelViews = {
  addLabel: 'duplicate-itinerary',
  editLabel: 'duplicate-itinerary',
  Detail: ItineraryDuplicatePanelDetail,
};
