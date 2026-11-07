import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { nanoid } from 'nanoid';
import {
  useFieldArray,
  useForm,
  UseFormReturn,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Editor, Input, Select } from 'erxes-ui';
import { PanelFormRow } from 'ui-modules';
import {
  TOURISM_PANEL_INPUT_CLASS_NAME,
  TourismPanelFormField,
  TourismPanelLanguageRow,
} from '@/tms/side-panel/TourismPanelForm';
import { GET_ITINERARIES } from '../../itinerary/graphql/queries';
import { SelectItinerary } from '../../itinerary/_components/SelectItinerary';
import { TourFormValues, TourCreateFormSchema } from '../constants/formSchema';
import { ITourDetail } from '../hooks/useTourDetail';
import { useTourCustomTypes } from '../hooks/useTourCustomFields';
import { useTourLanguage } from '../hooks/useTourLanguage';
import {
  buildEmptyTourTranslations,
  buildTranslationsFromTour,
  resolveMainLanguageName,
  syncTranslationPricingOptions,
} from '../utils/translationHelpers';
import {
  TourAttachmentsField,
  TourDateSchedulingField,
  TourGuidesField,
  TourImageThumbnailField,
  TourImagesField,
  TourInfo1Field,
  TourInfo2Field,
  TourInfo3Field,
  TourInfo4Field,
  TourInfo5Field,
  TourPricingOptionsField,
} from './TourFormFields';
import { SelectTourCategory } from './SelectTourCategory';

const TOUR_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

const INFO_SECTIONS = [
  { value: 'info1', labelKey: 'included' },
  { value: 'info2', labelKey: 'not-included' },
  { value: 'info3', labelKey: 'highlights' },
  { value: 'info4', labelKey: 'additional-information' },
  { value: 'info5', labelKey: 'notes' },
] as const;

type TInfoSection = (typeof INFO_SECTIONS)[number]['value'];

interface IItineraryOption {
  _id: string;
  duration?: number;
}

export const sortTourDates = (dates: Date[]) =>
  [...dates].sort((a, b) => a.getTime() - b.getTime());

export const calculateTourEndDate = (startDate: Date, duration?: number) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Number(duration || 0));

  return endDate;
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const getTourDateStatus = (
  startDate?: Date,
): 'scheduled' | 'unscheduled' | 'running' => {
  if (!startDate) {
    return 'unscheduled';
  }

  return isSameDay(startDate, new Date()) ? 'running' : 'scheduled';
};

const buildEmptyPricingOption = () => ({
  _id: nanoid(8),
  title: '',
  minPersons: 1,
  maxPersons: undefined,
  adultPrice: '' as const,
  childPrice: undefined,
  infantPrice: undefined,
  accommodationType: '',
  domesticFlightPerPerson: undefined,
  singleSupplement: undefined,
  note: '',
});

const buildTourFormDefaults = (withPricingOption: boolean): TourFormValues => ({
  name: '',
  refNumber: '',
  status: 'draft',
  customTourTypeId: 'tour',
  content: '',
  itineraryId: '',
  categoryIds: [],
  duration: 0,
  groupSize: 0,
  isFlexibleDate: false,
  isGroupTour: false,
  availableFrom: undefined,
  availableTo: undefined,
  startDate: undefined,
  endDate: undefined,
  advanceCheck: false,
  advancePercent: 0,
  joinPercent: 0,
  info1: '',
  info2: '',
  info3: '',
  info4: '',
  info5: '',
  images: [],
  imageThumbnail: '',
  attachment: null,
  guides: [],
  pricingOptions: withPricingOption ? [buildEmptyPricingOption()] : [],
  translations: [],
  customFieldsData: [],
});

export const tourToFormValues = (
  tour: ITourDetail,
  mainLanguage: string | undefined,
  translationLanguages: string[],
): TourFormValues => ({
  ...buildTourFormDefaults(false),
  name: resolveMainLanguageName(tour, mainLanguage),
  refNumber: tour.refNumber ?? '',
  status: tour.status ?? 'draft',
  customTourTypeId: tour.customTourTypeId ?? 'tour',
  content: tour.content ?? '',
  itineraryId: tour.itineraryId ?? '',
  categoryIds: tour.categoryIds ?? [],
  duration: tour.duration ?? 0,
  groupSize: tour.groupSize ?? 0,
  advanceCheck: tour.advanceCheck ?? false,
  advancePercent: tour.advancePercent ?? 0,
  joinPercent: tour.joinPercent ?? 0,
  info1: tour.info1 ?? '',
  info2: tour.info2 ?? '',
  info3: tour.info3 ?? '',
  info4: tour.info4 ?? '',
  info5: tour.info5 ?? '',
  images: tour.images ?? [],
  imageThumbnail: tour.imageThumbnail ?? '',
  attachment: tour.attachment ?? null,
  guides: (tour.guides ?? [])
    .filter((guide) => Boolean(guide?.guideId))
    .map((guide) => ({
      guideId: guide.guideId,
      type: guide.type ?? 'guide',
    })),
  pricingOptions: (tour.pricingOptions ?? []).map((option) => {
    const { prices, pricePerPerson, ...rest } = option;

    return {
      ...rest,
      adultPrice:
        prices.find((price) => price.type === 'adult')?.price ??
        pricePerPerson ??
        0,
      childPrice: prices.find((price) => price.type === 'child')?.price,
      infantPrice: prices.find((price) => price.type === 'infant')?.price,
    };
  }),
  isFlexibleDate: tour.dateType === 'flexible',
  isGroupTour: false,
  startDate: tour.startDate ? new Date(tour.startDate) : undefined,
  endDate: tour.endDate ? new Date(tour.endDate) : undefined,
  availableFrom: tour.availableFrom ? new Date(tour.availableFrom) : undefined,
  availableTo: tour.availableTo ? new Date(tour.availableTo) : undefined,
  translations: buildTranslationsFromTour(tour, translationLanguages),
  customFieldsData: tour.customFieldsData ?? [],
});

export const useTourPanelForm = ({
  branchId,
  branchLanguages,
  mainLanguage,
  isNew,
}: {
  branchId?: string;
  branchLanguages: string[];
  mainLanguage?: string;
  isNew: boolean;
}) => {
  const previousTypeRef = useRef<string | undefined>();

  const form = useForm<TourFormValues>({
    resolver: zodResolver(TourCreateFormSchema),
    defaultValues: buildTourFormDefaults(isNew),
  });

  useFieldArray({ control: form.control, name: 'translations' });

  const language = useTourLanguage({ branchLanguages, mainLanguage });
  const { translationLanguages } = language;
  const translationLanguagesKey = translationLanguages.join(',');

  useEffect(() => {
    if (!isNew || !translationLanguagesKey) return;
    const languages = translationLanguagesKey.split(',');
    const current = form.getValues('translations') || [];
    const currentLanguages = new Set(current.map((item) => item.language));

    if (languages.every((lang) => currentLanguages.has(lang))) {
      return;
    }

    form.setValue(
      'translations',
      buildEmptyTourTranslations(
        languages,
        (form.getValues('pricingOptions') || []).map((option) => option._id),
      ),
    );
  }, [isNew, translationLanguagesKey, form]);

  const [pricingOptions, itineraryId, startDate, duration, selectedType] =
    useWatch({
      control: form.control,
      name: [
        'pricingOptions',
        'itineraryId',
        'startDate',
        'duration',
        'customTourTypeId',
      ],
    });

  const pricingOptionIdsKey = (pricingOptions || [])
    .map((option) => option._id)
    .join(',');

  useEffect(() => {
    if (!translationLanguagesKey || !pricingOptionIdsKey) return;
    const current = form.getValues('translations');
    const synced = syncTranslationPricingOptions(
      current,
      pricingOptionIdsKey.split(',').filter(Boolean),
    );

    if (synced !== current) {
      form.setValue('translations', synced || []);
    }
  }, [pricingOptionIdsKey, translationLanguagesKey, form]);

  useEffect(() => {
    if (!selectedType) return;

    if (previousTypeRef.current && previousTypeRef.current !== selectedType) {
      form.setValue('customFieldsData', []);
    }

    previousTypeRef.current = selectedType;
  }, [selectedType, form]);

  const { data } = useQuery<{ bmsItineraries?: { list: IItineraryOption[] } }>(
    GET_ITINERARIES,
    {
      variables: { branchId, limit: 100, orderBy: { createdAt: -1 } },
      skip: !branchId,
    },
  );

  const selectedItinerary = useMemo(
    () => data?.bmsItineraries?.list.find((item) => item._id === itineraryId),
    [data, itineraryId],
  );

  useEffect(() => {
    if (selectedItinerary?.duration) {
      form.setValue('duration', selectedItinerary.duration);
    }
  }, [selectedItinerary, form]);

  useEffect(() => {
    const firstStartDate = Array.isArray(startDate)
      ? sortTourDates(startDate)[0]
      : startDate;

    if (!firstStartDate || !duration) {
      if (isNew) {
        form.setValue('endDate', undefined);
      }
      return;
    }

    form.setValue('endDate', calculateTourEndDate(firstStartDate, duration));
  }, [startDate, duration, form, isNew]);

  const { customTypes } = useTourCustomTypes(branchId);

  const resetToTour = useCallback(
    (tour: ITourDetail) => {
      previousTypeRef.current = tour.customTourTypeId ?? 'tour';
      form.reset(
        tourToFormValues(
          tour,
          mainLanguage,
          translationLanguagesKey.split(',').filter(Boolean),
        ),
        { keepDirty: false, keepTouched: false },
      );
    },
    [form, mainLanguage, translationLanguagesKey],
  );

  return { form, language, customTypes, resetToTour };
};

export type TTourPanelFormState = ReturnType<typeof useTourPanelForm>;

export const TourPanelSection = ({
  title,
  children,
}: {
  title?: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-1 pt-3 mt-2 border-t first:pt-0 first:mt-0 first:border-t-0">
    {title && (
      <div className="pb-1 text-xs font-semibold text-foreground">{title}</div>
    )}
    {children}
  </div>
);

const TourPanelInfoSection = ({
  form,
  fieldPaths,
}: {
  form: UseFormReturn<TourFormValues>;
  fieldPaths: TTourPanelFormState['language']['fieldPaths'];
}) => {
  const { t } = useTranslation('tourism');
  const [section, setSection] = useState<TInfoSection>('info1');
  const { control } = form;

  return (
    <>
      <PanelFormRow label={t('more-info')}>
        <Select
          value={section}
          onValueChange={(value) => setSection(value as TInfoSection)}
        >
          <Select.Trigger className={TOURISM_PANEL_INPUT_CLASS_NAME}>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {INFO_SECTIONS.map((item) => (
              <Select.Item key={item.value} value={item.value}>
                {t(item.labelKey)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </PanelFormRow>
      <div className="pt-1">
        {section === 'info1' && (
          <TourInfo1Field
            key={fieldPaths.info1}
            control={control}
            name={fieldPaths.info1}
          />
        )}
        {section === 'info2' && (
          <TourInfo2Field
            key={fieldPaths.info2}
            control={control}
            name={fieldPaths.info2}
          />
        )}
        {section === 'info3' && (
          <TourInfo3Field
            key={fieldPaths.info3}
            control={control}
            name={fieldPaths.info3}
          />
        )}
        {section === 'info4' && (
          <TourInfo4Field
            key={fieldPaths.info4}
            control={control}
            name={fieldPaths.info4}
          />
        )}
        {section === 'info5' && (
          <TourInfo5Field
            key={fieldPaths.info5}
            control={control}
            name={fieldPaths.info5}
          />
        )}
      </div>
    </>
  );
};

export type TTourPanelSection = 'all' | 'detail' | 'pricing' | 'media';

interface ITourPanelStateProps {
  state: TTourPanelFormState;
}

interface ITourPanelGeneralFieldsProps extends ITourPanelStateProps {
  branchId?: string;
  editorKey?: number;
}

interface ITourPanelPricingFieldsProps extends ITourPanelStateProps {
  titled?: boolean;
}

interface ITourPanelMediaFieldsProps extends ITourPanelPricingFieldsProps {
  editorKey?: number;
}

const useSuffixedLabel = (labelSuffix: string) => {
  const { t } = useTranslation('tourism');

  return (key: string) => (
    <>
      {t(key)}
      <span className="text-primary">{labelSuffix}</span>
    </>
  );
};

const TourPanelGeneralFields = ({
  state,
  branchId,
  editorKey = 0,
}: ITourPanelGeneralFieldsProps) => {
  const { t } = useTranslation('tourism');
  const { form, language, customTypes } = state;
  const { control } = form;
  const { selectedLang, labelSuffix, fieldPaths } = language;
  const suffixedLabel = useSuffixedLabel(labelSuffix);

  return (
    <>
      <TourPanelSection title={t('general-information')}>
        <TourismPanelFormField
          key={fieldPaths.name}
          control={control}
          name={fieldPaths.name}
          required
          label={suffixedLabel('name')}
          render={(field) => (
            <Input
              placeholder={t('tour-name')}
              className={TOURISM_PANEL_INPUT_CLASS_NAME}
              {...field}
            />
          )}
        />
        <TourismPanelFormField
          key={fieldPaths.refNumber}
          control={control}
          name={fieldPaths.refNumber}
          required
          label={suffixedLabel('ref-number')}
          render={(field) => (
            <Input
              placeholder={t('ref-number-label')}
              className={TOURISM_PANEL_INPUT_CLASS_NAME}
              {...field}
            />
          )}
        />
        <TourismPanelFormField
          control={control}
          name="status"
          required
          label={t('status')}
          render={(field) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <Select.Trigger className={TOURISM_PANEL_INPUT_CLASS_NAME}>
                <Select.Value placeholder={t('select-status')} />
              </Select.Trigger>
              <Select.Content>
                {TOUR_STATUS_OPTIONS.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          )}
        />
        {customTypes.length > 0 && (
          <TourismPanelFormField
            control={control}
            name="customTourTypeId"
            label={t('tour-type')}
            render={(field) => (
              <Select value={field.value || ''} onValueChange={field.onChange}>
                <Select.Trigger className={TOURISM_PANEL_INPUT_CLASS_NAME}>
                  <Select.Value placeholder={t('select-tour-type')} />
                </Select.Trigger>
                <Select.Content>
                  {customTypes.map((type) => (
                    <Select.Item key={type._id} value={type._id}>
                      {type.label || type.code || t('unnamed-type')}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />
        )}
        <TourismPanelFormField
          control={control}
          name="itineraryId"
          required
          label={t('itinerary')}
          render={(field) => (
            <SelectItinerary
              value={field.value}
              onValueChange={field.onChange}
              branchId={branchId}
              language={selectedLang}
              placeholder={t('select-itinerary-placeholder')}
              className={TOURISM_PANEL_INPUT_CLASS_NAME}
            />
          )}
        />
        <TourismPanelFormField
          control={control}
          name="categoryIds"
          label={t('categories')}
          render={(field) => (
            <SelectTourCategory
              value={field.value}
              onValueChange={field.onChange}
              placeholder={t('select-categories-placeholder')}
              branchId={branchId}
              language={selectedLang}
              className={TOURISM_PANEL_INPUT_CLASS_NAME}
            />
          )}
        />
      </TourPanelSection>

      <TourismPanelFormField
        key={`${fieldPaths.content}-${editorKey}`}
        control={control}
        name={fieldPaths.content}
        block
        label={suffixedLabel('content')}
        render={(field) => (
          <Editor
            initialContent={field.value}
            onChange={field.onChange}
            isHTML
          />
        )}
      />
    </>
  );
};

const TourPanelScheduleFields = ({ state }: ITourPanelStateProps) => {
  const { t } = useTranslation('tourism');
  const { form } = state;
  const { control } = form;

  return (
    <>
      <TourPanelSection title={t('duration-info')}>
        <TourismPanelFormField
          control={control}
          name="duration"
          label={t('duration-days')}
          render={(field) => (
            <Input
              type="number"
              placeholder="1"
              disabled
              className={TOURISM_PANEL_INPUT_CLASS_NAME}
              {...field}
            />
          )}
        />
        <TourismPanelFormField
          control={control}
          name="groupSize"
          label={t('group-size')}
          render={(field) => (
            <Input
              type="number"
              placeholder="0"
              className={TOURISM_PANEL_INPUT_CLASS_NAME}
              {...field}
            />
          )}
        />
        <TourDateSchedulingField control={control} setValue={form.setValue} />
      </TourPanelSection>

      <TourPanelSection title={t('crew')}>
        <TourGuidesField control={control} />
      </TourPanelSection>
    </>
  );
};

const TourPanelPricingFields = ({
  state,
  titled = true,
}: ITourPanelPricingFieldsProps) => {
  const { t } = useTranslation('tourism');
  const { form, language } = state;
  const { control } = form;
  const { labelSuffix, isMainLang, translationIndex, currencySymbol } =
    language;

  return (
    <TourPanelSection title={titled ? t('pricing-info') : undefined}>
      <TourPricingOptionsField
        key={`pricing-${translationIndex}`}
        control={control}
        translationIndex={isMainLang ? undefined : translationIndex}
        labelSuffix={labelSuffix}
        currencySymbol={currencySymbol}
      />
    </TourPanelSection>
  );
};

const TourPanelMediaFields = ({
  state,
  editorKey = 0,
  titled = true,
}: ITourPanelMediaFieldsProps) => {
  const { t } = useTranslation('tourism');
  const { form, language } = state;
  const { control } = form;
  const { fieldPaths } = language;

  return (
    <TourPanelSection title={titled ? t('more-info') : undefined}>
      <div className="flex flex-col gap-4">
        <TourImageThumbnailField control={control} />
        <TourImagesField control={control} />
        <TourAttachmentsField control={control} />
      </div>
      <TourPanelInfoSection
        key={`info-${editorKey}`}
        form={form}
        fieldPaths={fieldPaths}
      />
    </TourPanelSection>
  );
};

export const TourPanelFormFields = ({
  state,
  branchId,
  editorKey = 0,
  section = 'all',
}: ITourPanelGeneralFieldsProps & { section?: TTourPanelSection }) => {
  const { allLanguages, selectedLang, setSelectedLang } = state.language;
  const titled = section === 'all';
  const shows = (target: Exclude<TTourPanelSection, 'all'>) =>
    section === 'all' || section === target;

  return (
    <>
      <TourismPanelLanguageRow
        languages={allLanguages}
        value={selectedLang}
        onValueChange={setSelectedLang}
      />
      {shows('detail') && (
        <>
          <TourPanelGeneralFields
            state={state}
            branchId={branchId}
            editorKey={editorKey}
          />
          <TourPanelScheduleFields state={state} />
        </>
      )}
      {shows('pricing') && (
        <TourPanelPricingFields state={state} titled={titled} />
      )}
      {shows('media') && (
        <TourPanelMediaFields
          state={state}
          editorKey={editorKey}
          titled={titled}
        />
      )}
    </>
  );
};
