import { NetworkStatus, useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CONTENT_CREATE_CMS,
  CONTENT_DELETE_CMS,
  CONTENT_UPDATE_CMS,
} from '../../graphql/mutations';
import { CONTENT_CMS_LIST, GET_WEBSITES } from '../../graphql/queries';
import { DEFAULT_SETTINGS } from '../constants/defaultSettings';
import {
  ClientPortalOption,
  CmsSettingsData,
  SettingsFormState,
  UpdateSetting,
} from '../types/settingsTypes';
import { buildPublicUrl } from '../utils/settingsHelpers';

export const useSettingsForm = () => {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const [hydratedSettingsKey, setHydratedSettingsKey] = useState<string>();
  const [settings, setSettings] = useState<SettingsFormState>(DEFAULT_SETTINGS);
  const mutationOptions = {
    refetchQueries: [{ query: CONTENT_CMS_LIST }],
    awaitRefetchQueries: true,
  };

  const cmsQuery = useQuery(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-first',
  });

  const websitesQuery = useQuery(GET_WEBSITES, {
    fetchPolicy: 'cache-first',
  });

  const { data: cmsData, networkStatus: cmsNetworkStatus } = cmsQuery;
  const { data: websitesData, networkStatus: websitesNetworkStatus } =
    websitesQuery;

  const cmsQueryFetched =
    cmsNetworkStatus === NetworkStatus.ready &&
    cmsQuery.observable.getCurrentResult().partial !== true &&
    Array.isArray(cmsData?.contentCMSList);

  const websitesQueryFetched =
    websitesNetworkStatus === NetworkStatus.ready &&
    websitesQuery.observable.getCurrentResult().partial !== true &&
    Array.isArray(websitesData?.getClientPortals?.list);

  const settingsQueriesFetched = cmsQueryFetched && websitesQueryFetched;

  const [createCMS, { loading: creatingCMS }] = useMutation(
    CONTENT_CREATE_CMS,
    mutationOptions,
  );
  const [updateCMS, { loading: updatingCMS }] = useMutation(
    CONTENT_UPDATE_CMS,
    mutationOptions,
  );
  const [deleteCMS, { loading: deletingCMS }] = useMutation(
    CONTENT_DELETE_CMS,
    mutationOptions,
  );

  const cms: CmsSettingsData | undefined = useMemo(
    () =>
      cmsData?.contentCMSList?.find(
        (item: CmsSettingsData) => item.clientPortalId === websiteId,
      ),
    [cmsData, websiteId],
  );

  const clientPortalList = websitesData?.getClientPortals?.list;

  const clientPortals = useMemo<ClientPortalOption[]>(
    () => clientPortalList || [],
    [clientPortalList],
  );

  const clientPortal = useMemo(
    () => clientPortals.find((item) => item._id === websiteId),
    [clientPortals, websiteId],
  );

  const hydrationKey = cms?._id
    ? `${websiteId}:cms:${cms._id}`
    : clientPortal?._id
    ? `${websiteId}:clientPortal:${clientPortal._id}`
    : undefined;

  useEffect(() => {
    if (
      !websiteId ||
      !settingsQueriesFetched ||
      !hydrationKey ||
      hydratedSettingsKey === hydrationKey ||
      (!cms && !clientPortal)
    ) {
      return;
    }

    const domain =
      cms?.domain || clientPortal?.domain || DEFAULT_SETTINGS.domain;
    const languages = cms?.languages?.length
      ? cms.languages
      : DEFAULT_SETTINGS.languages;

    setSettings({
      ...DEFAULT_SETTINGS,
      websiteName:
        cms?.name || clientPortal?.name || DEFAULT_SETTINGS.websiteName,
      clientPortalKind: clientPortal?._id || websiteId,
      shortDescription:
        cms?.description ||
        clientPortal?.description ||
        DEFAULT_SETTINGS.shortDescription,
      domain,
      publicUrl: cms?.publicUrl || buildPublicUrl(domain),
      metaTitle: cms?.metaTitle || DEFAULT_SETTINGS.metaTitle,
      metaDescription: cms?.metaDescription || DEFAULT_SETTINGS.metaDescription,
      metaKeywords: cms?.metaKeywords?.length
        ? cms.metaKeywords
        : DEFAULT_SETTINGS.metaKeywords,
      metaImage: cms?.metaImage || DEFAULT_SETTINGS.metaImage,
      gaTrackingId: cms?.googleTrackingId || DEFAULT_SETTINGS.gaTrackingId,
      googleTagManagerId:
        cms?.googleTagManagerId || DEFAULT_SETTINGS.googleTagManagerId,
      customHeadScripts: cms?.customScripts?.length
        ? cms.customScripts.join('\n')
        : DEFAULT_SETTINGS.customHeadScripts,
      postUrlField: cms?.postUrlField || DEFAULT_SETTINGS.postUrlField,
      postUrlPrefix: cms?.postUrlPrefix ?? DEFAULT_SETTINGS.postUrlPrefix,
      defaultPostStatus:
        cms?.defaultPostStatus || DEFAULT_SETTINGS.defaultPostStatus,
      allowComments: cms?.allowComments ?? DEFAULT_SETTINGS.allowComments,
      languages,
      defaultLanguage:
        cms?.language || languages[0] || DEFAULT_SETTINGS.defaultLanguage,
      siteLogo: cms?.siteLogo || DEFAULT_SETTINGS.siteLogo,
      favicon: cms?.favicon || DEFAULT_SETTINGS.favicon,
    });
    setHydratedSettingsKey(hydrationKey);
  }, [
    clientPortal,
    cms,
    hydratedSettingsKey,
    hydrationKey,
    settingsQueriesFetched,
    websiteId,
  ]);

  const updateSetting: UpdateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const buildSettingsInput = (includeContent: boolean) => {
    const languages = settings.languages.filter(Boolean);
    const language = languages.includes(settings.defaultLanguage)
      ? settings.defaultLanguage
      : languages[0];
    const input = {
      name: settings.websiteName.trim(),
      description: settings.shortDescription.trim(),
      clientPortalId: settings.clientPortalKind || websiteId,
      domain: settings.domain.trim(),
      publicUrl: settings.publicUrl.trim(),
      metaTitle: settings.metaTitle.trim(),
      metaDescription: settings.metaDescription.trim(),
      metaKeywords: settings.metaKeywords
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      metaImage: settings.metaImage,
      googleTrackingId: settings.gaTrackingId.trim(),
      googleTagManagerId: settings.googleTagManagerId.trim(),
      customScripts: settings.customHeadScripts
        .split('\n')
        .map((script) => script.trim())
        .filter(Boolean),
      defaultPostStatus: settings.defaultPostStatus,
      allowComments: settings.allowComments,
      language,
      languages,
      postUrlField: settings.postUrlField,
      postUrlPrefix: settings.postUrlPrefix,
      siteLogo: settings.siteLogo,
      favicon: settings.favicon,
    };

    return includeContent
      ? {
          ...input,
          content: cms?.content || '',
        }
      : input;
  };

  const handleSave = async () => {
    if (!websiteId) {
      toast({
        title: 'Settings not saved',
        description: 'Select a CMS website before saving settings.',
        variant: 'destructive',
      });
      return;
    }

    if (!settingsQueriesFetched) {
      toast({
        title: 'Settings not saved',
        description: 'Settings are still loading. Try again in a moment.',
        variant: 'destructive',
      });
      return;
    }

    if (!settings.websiteName.trim() || !settings.shortDescription.trim()) {
      toast({
        title: 'Settings not saved',
        description: 'Website name and short description are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (cms?._id) {
        await updateCMS({
          variables: {
            id: cms._id,
            input: buildSettingsInput(false),
          },
        });

        toast({
          title: 'Success',
          description: 'CMS settings updated successfully.',
        });
        return;
      }

      await createCMS({
        variables: {
          input: buildSettingsInput(true),
        },
      });

      toast({
        title: 'Success',
        description: 'CMS settings created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to save CMS settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!cms?._id) {
      toast({
        title: 'CMS not deleted',
        description: 'Save this CMS before trying to delete it.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteCMS({
        variables: {
          id: cms._id,
        },
        refetchQueries: [{ query: CONTENT_CMS_LIST }],
        awaitRefetchQueries: true,
      });

      toast({
        title: 'Success',
        description: 'CMS deleted successfully.',
      });
      navigate('/content/cms');
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to delete CMS. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return {
    canSave:
      Boolean(websiteId) &&
      settingsQueriesFetched &&
      !creatingCMS &&
      !updatingCMS &&
      !deletingCMS,
    clientPortals,
    cms,
    isDeleting: deletingCMS,
    isSaving: creatingCMS || updatingCMS,
    settings,
    updateSetting,
    handleDelete,
    handleSave,
  };
};
