import { useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  const [hydratedWebsiteId, setHydratedWebsiteId] = useState<string>();
  const [settings, setSettings] = useState<SettingsFormState>(DEFAULT_SETTINGS);

  const { data: cmsData } = useQuery(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-first',
  });

  const { data: websitesData } = useQuery(GET_WEBSITES, {
    fetchPolicy: 'cache-first',
  });

  const cms: CmsSettingsData | undefined = useMemo(
    () =>
      cmsData?.contentCMSList?.find(
        (item: CmsSettingsData) => item.clientPortalId === websiteId,
      ),
    [cmsData, websiteId],
  );

  const clientPortals: ClientPortalOption[] =
    websitesData?.getClientPortals?.list || [];

  const clientPortal = useMemo(
    () => clientPortals.find((item) => item._id === websiteId),
    [clientPortals, websiteId],
  );

  useEffect(() => {
    if (
      !websiteId ||
      hydratedWebsiteId === websiteId ||
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
      gaTrackingId: cms?.googleTrackingId || DEFAULT_SETTINGS.gaTrackingId,
      googleTagManagerId:
        cms?.googleTagManagerId || DEFAULT_SETTINGS.googleTagManagerId,
      customHeadScripts: cms?.customScripts?.length
        ? cms.customScripts.join('\n')
        : DEFAULT_SETTINGS.customHeadScripts,
      postUrlField: cms?.postUrlField || DEFAULT_SETTINGS.postUrlField,
      defaultPostStatus:
        cms?.defaultPostStatus || DEFAULT_SETTINGS.defaultPostStatus,
      allowComments: cms?.allowComments ?? DEFAULT_SETTINGS.allowComments,
      languages,
      defaultLanguage:
        cms?.language || languages[0] || DEFAULT_SETTINGS.defaultLanguage,
    });
    setHydratedWebsiteId(websiteId);
  }, [clientPortal, cms, hydratedWebsiteId, websiteId]);

  const updateSetting: UpdateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleRemoveLanguage = (language: string) => {
    setSettings((current) => {
      const languages = current.languages.filter((item) => item !== language);

      return {
        ...current,
        languages,
        defaultLanguage: languages.includes(current.defaultLanguage)
          ? current.defaultLanguage
          : languages[0] || current.defaultLanguage,
      };
    });
  };

  const handleSave = () => {
    // TODO: Wire this local settings form to contentUpdateCMS once the API contract is finalized.
    toast({
      title: 'Settings not saved',
      description: 'The CMS settings save mutation is still TODO.',
    });
  };

  const handleTodoAction = () => {
    toast({
      title: 'Pending implementation',
      description:
        'This control is UI-only until the CMS settings backend is wired.',
    });
  };

  return {
    clientPortals,
    settings,
    updateSetting,
    handleRemoveLanguage,
    handleSave,
    handleTodoAction,
  };
};
