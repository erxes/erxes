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
  TMS_AMENITY_CONTENT_TYPE,
} from '@/tms/side-panel/tourismPanelTypes';
import {
  useTourismPanel,
  useTourismPanelBranch,
  useTourismPanelDraft,
} from '@/tms/side-panel/useTourismPanel';
import {
  AmenityCreateFormSchema,
  AmenityCreateFormType,
} from '../constants/formSchema';
import { REMOVE_AMENITY } from '../graphql/mutation';
import { GET_AMENITY_DETAIL } from '../graphql/queries';
import { useAmenityLanguage } from '../hooks/useAmenityLanguage';
import { useCreateAmenity } from '../hooks/useCreateAmenity';
import { useEditAmenity } from '../hooks/useEditAmenity';
import { IAmenity } from '../types/amenity';
import {
  buildEmptyAmenityTranslations,
  buildTranslationsFromAmenity,
  resolveMainLanguageName,
  sanitizeAmenityTranslations,
} from '../utils/translationHelpers';
import { AmenityIconField, AmenityNameField } from './AmenityFormFields';

interface AmenityPanelFormProps {
  amenity?: IAmenity;
  branchId?: string;
  branchLanguages: string[];
  mainLanguage?: string;
  onCancel: () => void;
  onCreated?: (amenityId: string) => void;
  onUpdated?: () => void;
}

const AmenityPanelForm = ({
  amenity,
  branchId,
  branchLanguages,
  mainLanguage,
  onCancel,
  onCreated,
  onUpdated,
}: AmenityPanelFormProps) => {
  const { t } = useTranslation('tourism');
  const { toast } = useToast();
  const { createAmenity, loading: creating } = useCreateAmenity();
  const { editAmenity, loading: updating } = useEditAmenity();

  const {
    allLanguages,
    translationLanguages,
    selectedLang,
    setSelectedLang,
    isMainLang,
    labelSuffix,
    fieldPaths,
  } = useAmenityLanguage({ branchLanguages, mainLanguage });

  const form = useForm<AmenityCreateFormType>({
    resolver: zodResolver(AmenityCreateFormSchema),
    defaultValues: amenity
      ? {
          name: resolveMainLanguageName(amenity, mainLanguage),
          icon: amenity.icon || '',
          translations: buildTranslationsFromAmenity(
            amenity,
            translationLanguages,
          ),
        }
      : {
          name: '',
          icon: '',
          translations: buildEmptyAmenityTranslations(translationLanguages),
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

  const handleSubmit = async (values: AmenityCreateFormType) => {
    const icon =
      values.icon && values.icon.trim() !== '' ? { icon: values.icon } : {};
    const translations = sanitizeAmenityTranslations(values.translations);

    if (amenity) {
      const mainName = isMainLang
        ? values.name
        : values.name ||
          values.translations?.find((tr) => tr.language === mainLanguage)
            ?.name ||
          amenity.name ||
          '';

      try {
        await editAmenity({
          variables: {
            id: amenity._id,
            name: mainName,
            icon: values.icon?.trim() ?? '',
            quick: true,
            language: mainLanguage,
            translations,
          },
        });

        toast({
          title: t('success'),
          description: t('amenity-updated-successfully'),
        });
        onUpdated?.();
      } catch (error) {
        showError(error, 'failed-to-update-amenity');
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
      const result = await createAmenity({
        variables: {
          branchId,
          name: values.name,
          ...icon,
          quick: true,
          language: mainLanguage,
          translations,
        },
      });

      toast({
        title: t('success'),
        description: t('amenity-created-successfully'),
      });

      const createdId = result.data?.bmsElementAdd?._id;

      if (createdId) {
        onCreated?.(createdId);
      }
    } catch (error) {
      showError(error, 'failed-to-create-amenity');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          handleSubmit,
          amenity ? undefined : onInvalid,
        )}
        className="flex flex-1 min-h-0 flex-col"
      >
        <PanelFormLayout
          onCancel={onCancel}
          saving={creating || updating}
          saveLabel={amenity ? t('update') : t('create')}
        >
          <TourismPanelLanguageRow
            languages={allLanguages}
            value={selectedLang}
            onValueChange={setSelectedLang}
          />
          <div key={selectedLang} className="flex flex-col gap-1">
            <AmenityNameField
              key={fieldPaths.name}
              control={form.control}
              name={fieldPaths.name}
              labelSuffix={labelSuffix}
            />
            <AmenityIconField control={form.control} />
          </div>
        </PanelFormLayout>
      </form>
    </Form>
  );
};

const AmenityPanelNew = () => {
  const { branchId } = useTourismPanelDraft(TMS_AMENITY_CONTENT_TYPE);
  const { openDetail, cancelDraft } = useTourismPanel(TMS_AMENITY_CONTENT_TYPE);
  const { branch, branchLanguages, mainLanguage, loading } =
    useTourismPanelBranch(branchId);

  return (
    <TourismPanelRecordState
      loading={loading}
      hasRecord={!!branchId && (!!branch || !loading)}
    >
      <AmenityPanelForm
        key={branchId}
        branchId={branchId}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
        onCancel={cancelDraft}
        onCreated={(amenityId) => openDetail(amenityId, { replace: true })}
      />
    </TourismPanelRecordState>
  );
};

const AmenityPanelDetail = ({ contentId }: ITourismPanelViewProps) => {
  const { closePanel } = useTourismPanel(TMS_AMENITY_CONTENT_TYPE);
  const { data, loading } = useQuery<{ bmsElementDetail?: IAmenity }>(
    GET_AMENITY_DETAIL,
    {
      variables: { id: contentId },
      fetchPolicy: 'network-only',
    },
  );
  const amenity = data?.bmsElementDetail;
  const {
    branch,
    branchId,
    branchLanguages,
    mainLanguage,
    loading: branchLoading,
  } = useTourismPanelBranch(amenity?.branchId);

  return (
    <TourismPanelRecordState
      loading={loading || branchLoading}
      hasRecord={!!amenity && (!!branch || !branchLoading)}
    >
      {amenity && (
        <AmenityPanelForm
          key={amenity._id}
          amenity={amenity}
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

const AmenityPanelActions = ({ contentId }: ITourismPanelViewProps) => {
  const { t } = useTranslation('tourism');
  const { toast } = useToast();
  const [removeAmenities, { loading }] = useMutation(REMOVE_AMENITY, {
    refetchQueries: ['BmsAmenities'],
  });

  return (
    <TourismPanelRemoveAction
      message={t('confirm-delete-amenity')}
      loading={loading}
      onRemove={(onCompleted) =>
        removeAmenities({
          variables: { ids: [contentId] },
          onCompleted: () => {
            toast({
              title: t('success'),
              variant: 'success',
              description: t('amenity-deleted-successfully'),
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

export const AmenityCreateButton = ({ branchId }: { branchId?: string }) => {
  const { t } = useTranslation('tourism');
  const { openDraft } = useTourismPanel(TMS_AMENITY_CONTENT_TYPE);

  return (
    <Button onClick={() => openDraft({ branchId })}>
      <IconPlus />
      {t('create-amenity')}
    </Button>
  );
};

const useAmenityPanelHeading = (contentId: string) => {
  const { data } = useQuery<{ bmsElementDetail?: IAmenity }>(
    GET_AMENITY_DETAIL,
    { variables: { id: contentId } },
  );

  return { name: data?.bmsElementDetail?.name };
};

export const AMENITY_PANEL: ITourismPanelViews = {
  addLabel: 'create-amenity',
  editLabel: 'edit-amenity',
  New: AmenityPanelNew,
  useHeading: useAmenityPanelHeading,
  Detail: AmenityPanelDetail,
  Actions: AmenityPanelActions,
};
