import { useEffect, useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { useTranslation } from 'react-i18next';
import { Button, Form, useToast } from 'erxes-ui';
import { PanelFormLayout, PanelFormRow } from 'ui-modules';
import { TourismPanelRecordState } from '@/tms/side-panel/TourismPanelLayout';
import { TourismPanelRemoveAction } from '@/tms/side-panel/TourismPanelRemoveAction';
import {
  ITourismPanelViewProps,
  ITourismPanelViews,
  TMS_TOUR_CONTENT_TYPE,
} from '@/tms/side-panel/tourismPanelTypes';
import {
  useTourismPanel,
  useTourismPanelBranch,
  useTourismPanelDraft,
} from '@/tms/side-panel/useTourismPanel';
import { TourFormValues } from '../constants/formSchema';
import { useCreateTour } from '../hooks/useCreateTour';
import { useEditTour } from '../hooks/useEditTour';
import { useRemoveTours } from '../hooks/useRemoveTours';
import { ITourDetail, useTourDetail } from '../hooks/useTourDetail';
import { useTourCustomFieldGroups } from '../hooks/useTourCustomFields';
import {
  CustomFieldValue,
  filterCustomFieldsData,
  TourCustomFieldData,
} from '../utils/customFields';
import { normalizePricingOptionsForApi } from '../utils/pricingOptions';
import { sanitizeTourTranslations } from '../utils/translationHelpers';
import { TourCustomFieldInput } from './TourCustomFieldInput';
import { TourCustomersPanel } from './TourCustomersPanel';
import { TourOrdersPanel } from './TourOrdersPanel';
import {
  calculateTourEndDate,
  getTourDateStatus,
  sortTourDates,
  TourPanelFormFields,
  TourPanelSection,
  useTourPanelForm,
} from './TourPanelForm';

const NON_INPUT_KEYS = [
  'startDate',
  'endDate',
  'availableFrom',
  'availableTo',
  'isFlexibleDate',
  'isGroupTour',
  'pricingOptions',
  'translations',
  'customFieldsData',
] as const;

type TNonInputKey = (typeof NON_INPUT_KEYS)[number];

const toTourInput = (values: TourFormValues) => {
  const rest: Partial<TourFormValues> = { ...values };
  NON_INPUT_KEYS.forEach((key) => delete rest[key]);

  return {
    rest: rest as Omit<TourFormValues, TNonInputKey>,
    pricingOptions: normalizePricingOptionsForApi(values.pricingOptions),
    translations: sanitizeTourTranslations(values.translations ?? []),
    customFieldsData: filterCustomFieldsData(values.customFieldsData),
  };
};

const getStartDates = (values: TourFormValues) => {
  if (values.isFlexibleDate || !values.startDate) {
    return [];
  }

  return Array.isArray(values.startDate)
    ? sortTourDates(values.startDate)
    : [values.startDate];
};

const TourPanelNew = () => {
  const { t } = useTranslation('tourism');
  const { toast } = useToast();
  const { branchId } = useTourismPanelDraft(TMS_TOUR_CONTENT_TYPE);
  const { openDetail, cancelDraft, closePanel } = useTourismPanel(
    TMS_TOUR_CONTENT_TYPE,
  );
  const { branch, branchLanguages, mainLanguage, loading } =
    useTourismPanelBranch(branchId);
  const { createTour, loading: creating } = useCreateTour();
  const state = useTourPanelForm({
    branchId,
    branchLanguages,
    mainLanguage,
    isNew: true,
  });
  const { form, language } = state;
  const primaryLanguage = mainLanguage ?? language.allLanguages[0] ?? '';

  const handleSubmit = async (values: TourFormValues) => {
    if (!branchId) {
      toast({
        title: t('error'),
        description: t('branch-required'),
        variant: 'destructive',
      });
      return;
    }

    if (!values.pricingOptions?.length) {
      toast({
        title: t('error'),
        description: t('at-least-one-pricing'),
        variant: 'destructive',
      });
      return;
    }

    const { rest, pricingOptions, translations, customFieldsData } =
      toTourInput(values);
    const groupCode = nanoid(8);
    const base = {
      branchId,
      language: primaryLanguage || undefined,
      ...rest,
      customFieldsData,
      pricingOptions,
      translations,
      groupCode,
    };

    const startDates = getStartDates(values);
    const selectedDates = values.isGroupTour
      ? startDates
      : startDates.slice(0, 1);
    const isMulti = values.isGroupTour && selectedDates.length > 1;
    const getRefNumber = (index: number) =>
      isMulti
        ? `${rest.refNumber}-${String(index + 1).padStart(2, '0')}`
        : rest.refNumber;

    const variablesList = values.isFlexibleDate
      ? [
          {
            ...base,
            dateType: 'flexible' as const,
            availableFrom: values.availableFrom,
            availableTo: values.availableTo,
            date_status: 'unscheduled' as const,
          },
        ]
      : (selectedDates.length ? selectedDates : [undefined]).map(
          (date, index) => ({
            ...base,
            refNumber: getRefNumber(index),
            dateType: 'fixed' as const,
            startDate: date,
            endDate: date
              ? calculateTourEndDate(date, values.duration)
              : undefined,
            date_status: getTourDateStatus(date),
          }),
        );

    try {
      const results = await Promise.all(
        variablesList.map((variables) => createTour({ variables })),
      );
      const createdIds = results
        .map((result) => result.data?.bmsTourAdd?._id)
        .filter((id): id is string => !!id);

      toast({
        title: t('success'),
        description: t('tour-created-successfully'),
      });

      if (createdIds.length === 1) {
        openDetail(createdIds[0], { replace: true });
        return;
      }

      closePanel();
    } catch (error) {
      toast({
        title: t('error'),
        description:
          error instanceof Error ? error.message : t('failed-to-create-tour'),
        variant: 'destructive',
      });
    }
  };

  const onInvalid = () => {
    if (!form.getValues('name')?.trim()) {
      toast({
        title: t('error'),
        description: t('enter-main-lang-before-creating'),
        variant: 'destructive',
      });
      language.setSelectedLang(primaryLanguage);
    }
  };

  return (
    <TourismPanelRecordState
      loading={loading}
      hasRecord={!!branchId && (!!branch || !loading)}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit, onInvalid)}
          className="flex flex-1 min-h-0 flex-col"
        >
          <PanelFormLayout
            onCancel={cancelDraft}
            saving={creating}
            saveLabel={t('create')}
          >
            <TourPanelFormFields state={state} branchId={branchId} />
          </PanelFormLayout>
        </form>
      </Form>
    </TourismPanelRecordState>
  );
};

const TourPanelEditForm = ({
  tour,
  branchId,
  branchLanguages,
  mainLanguage,
}: {
  tour: ITourDetail;
  branchId: string;
  branchLanguages: string[];
  mainLanguage?: string;
}) => {
  const { t } = useTranslation('tourism');
  const { toast } = useToast();
  const { closePanel } = useTourismPanel(TMS_TOUR_CONTENT_TYPE);
  const { editTour, loading: editing } = useEditTour();
  const { createTour, loading: creating } = useCreateTour();
  const [editorKey, setEditorKey] = useState(0);
  const state = useTourPanelForm({
    branchId,
    branchLanguages,
    mainLanguage,
    isNew: false,
  });
  const { form, language, resetToTour } = state;
  const primaryLanguage =
    tour.language ?? mainLanguage ?? language.allLanguages[0] ?? '';

  useEffect(() => {
    resetToTour(tour);
    setEditorKey((key) => key + 1);
  }, [tour, resetToTour]);

  const handleSubmit = async (values: TourFormValues) => {
    if (!values.pricingOptions?.length) {
      toast({
        title: t('error'),
        description: t('at-least-one-pricing'),
        variant: 'destructive',
      });
      return;
    }

    const { rest, pricingOptions, translations, customFieldsData } =
      toTourInput(values);
    const startDates = getStartDates(values);
    const primaryStartDate = startDates[0];
    const additionalDates = values.isGroupTour ? startDates.slice(1) : [];
    const isFlexible = values.isFlexibleDate;

    try {
      await editTour({
        id: tour._id,
        language: primaryLanguage || undefined,
        ...rest,
        customFieldsData,
        pricingOptions,
        translations,
        dateType: isFlexible ? 'flexible' : 'fixed',
        startDate: isFlexible ? undefined : primaryStartDate,
        endDate:
          !isFlexible && primaryStartDate && values.duration
            ? calculateTourEndDate(primaryStartDate, values.duration)
            : undefined,
        availableFrom: isFlexible ? values.availableFrom : undefined,
        availableTo: isFlexible ? values.availableTo : undefined,
        dateStatus: isFlexible
          ? 'unscheduled'
          : getTourDateStatus(primaryStartDate),
      });

      if (additionalDates.length) {
        const groupCode = tour.groupCode || nanoid(8);

        await Promise.all(
          additionalDates.map((date, index) =>
            createTour({
              variables: {
                branchId,
                language: primaryLanguage || undefined,
                ...rest,
                customFieldsData,
                refNumber: `${rest.refNumber}-${String(index + 2).padStart(
                  2,
                  '0',
                )}`,
                pricingOptions,
                dateType: 'fixed',
                startDate: date,
                endDate: calculateTourEndDate(date, values.duration),
                date_status: getTourDateStatus(date),
                groupCode,
                translations,
              },
            }),
          ),
        );
      }

      toast({
        title: t('success'),
        description: additionalDates.length
          ? t('tour-updated-and-created', { count: additionalDates.length })
          : t('tour-updated-successfully'),
      });
      closePanel();
    } catch (error) {
      toast({
        title: t('error'),
        description:
          error instanceof Error ? error.message : t('failed-to-update-tour'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-1 min-h-0 flex-col"
      >
        <PanelFormLayout
          onCancel={closePanel}
          saving={editing || creating}
          saveLabel={t('update')}
        >
          <TourPanelFormFields
            state={state}
            branchId={branchId}
            editorKey={editorKey}
          />
          <TourPanelSection title={t('bookings')}>
            <div className="-mx-3">
              <TourOrdersPanel tourId={tour._id} />
            </div>
          </TourPanelSection>
          <TourPanelSection>
            <div className="-mx-3">
              <TourCustomersPanel tourId={tour._id} />
            </div>
          </TourPanelSection>
        </PanelFormLayout>
      </form>
    </Form>
  );
};

const TourPanelDetail = ({ contentId }: ITourismPanelViewProps) => {
  const { tourDetail, loading } = useTourDetail({
    variables: { id: contentId },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });
  const {
    branch,
    branchId,
    branchLanguages,
    mainLanguage,
    loading: branchLoading,
  } = useTourismPanelBranch(tourDetail?.branchId);

  return (
    <TourismPanelRecordState
      loading={loading || branchLoading}
      hasRecord={!!tourDetail && !!branch}
    >
      {tourDetail && branch && (
        <TourPanelEditForm
          key={`${tourDetail._id}-${branch._id}`}
          tour={tourDetail}
          branchId={branchId}
          branchLanguages={branchLanguages}
          mainLanguage={mainLanguage}
        />
      )}
    </TourismPanelRecordState>
  );
};

const toCustomFieldEntries = (data?: TourCustomFieldData[]) =>
  (data ?? []).map((item) => ({ field: item.field, value: item.value }));

const TourPanelProperties = ({ contentId }: ITourismPanelViewProps) => {
  const { t } = useTranslation('tourism');
  const { toast } = useToast();
  const { branchId } = useTourismPanelBranch();
  const { editTour, loading: saving } = useEditTour();
  const { tourDetail, loading } = useTourDetail({
    variables: { id: contentId },
    fetchPolicy: 'cache-and-network',
  });
  const tourBranchId = tourDetail?.branchId || branchId;
  const { fieldGroups, loading: groupsLoading } = useTourCustomFieldGroups({
    branchId: tourBranchId,
    selectedType: tourDetail?.customTourTypeId ?? 'tour',
    tourId: contentId,
  });
  const [values, setValues] = useState<TourCustomFieldData[]>([]);

  useEffect(() => {
    setValues(toCustomFieldEntries(tourDetail?.customFieldsData));
  }, [tourDetail?.customFieldsData]);

  const getValue = (fieldId: string): CustomFieldValue =>
    values.find((item) => item.field === fieldId)?.value ?? '';

  const setValue = (fieldId: string, value: string | boolean | string[]) =>
    setValues((current) => [
      ...current.filter((item) => item.field !== fieldId),
      { field: fieldId, value },
    ]);

  const missingRequired = fieldGroups
    .flatMap((group) => group.fields ?? [])
    .find((field) => {
      const fieldId = field._id || field.code;
      const value = fieldId ? getValue(fieldId) : '';

      return (
        field.isRequired &&
        (value === '' ||
          value === null ||
          value === undefined ||
          (Array.isArray(value) && !value.length))
      );
    });

  const handleSave = async () => {
    if (!tourDetail) return;

    if (missingRequired) {
      toast({
        title: t('error'),
        description: missingRequired.label,
        variant: 'destructive',
      });
      return;
    }

    try {
      await editTour({
        id: tourDetail._id,
        dateStatus: tourDetail.date_status ?? 'unscheduled',
        customFieldsData: filterCustomFieldsData(values) ?? [],
      });
      toast({
        title: t('success'),
        description: t('tour-updated-successfully'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description:
          error instanceof Error ? error.message : t('failed-to-update-tour'),
        variant: 'destructive',
      });
    }
  };

  if (!tourDetail || (groupsLoading && !fieldGroups.length)) {
    return (
      <TourismPanelRecordState
        loading={loading || groupsLoading}
        hasRecord={false}
      />
    );
  }

  if (!fieldGroups.length) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        {t('no-custom-field-groups-yet')}
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSave();
      }}
      className="flex flex-1 min-h-0 flex-col"
    >
      <PanelFormLayout
        onCancel={() =>
          setValues(toCustomFieldEntries(tourDetail.customFieldsData))
        }
        saving={saving}
        saveLabel={t('save')}
      >
        {fieldGroups.map((group) => (
          <TourPanelSection key={group._id} title={group.label}>
            {(group.fields ?? []).map((field) => {
              const fieldId = field._id || field.code;

              if (!fieldId) {
                return null;
              }

              return (
                <PanelFormRow
                  key={fieldId}
                  label={field.label}
                  required={field.isRequired}
                >
                  <TourCustomFieldInput
                    field={{ ...field, _id: fieldId }}
                    value={getValue(fieldId)}
                    onChange={(value) => setValue(fieldId, value)}
                  />
                </PanelFormRow>
              );
            })}
          </TourPanelSection>
        ))}
      </PanelFormLayout>
    </form>
  );
};

const TourPanelActions = ({ contentId }: ITourismPanelViewProps) => {
  const { t } = useTranslation('tourism');
  const { toast } = useToast();
  const { removeTours, loading } = useRemoveTours();

  return (
    <TourismPanelRemoveAction
      message={t('confirm-delete-tour')}
      loading={loading}
      onRemove={(onCompleted) =>
        removeTours({
          variables: { ids: [contentId] },
          onCompleted: () => {
            toast({
              title: t('success'),
              description: t('tour-deleted-successfully'),
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

export const TourCreateButton = ({ branchId }: { branchId?: string }) => {
  const { t } = useTranslation('tourism');
  const { openDraft } = useTourismPanel(TMS_TOUR_CONTENT_TYPE);

  return (
    <Button onClick={() => openDraft({ branchId })}>
      <IconPlus />
      {t('create-tour')}
    </Button>
  );
};

export const TOUR_PANEL: ITourismPanelViews = {
  addLabel: 'create-tour',
  editLabel: 'edit-tour',
  New: TourPanelNew,
  Detail: TourPanelDetail,
  Properties: TourPanelProperties,
  Actions: TourPanelActions,
};
