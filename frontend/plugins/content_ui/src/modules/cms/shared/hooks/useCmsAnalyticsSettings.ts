import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { CONTENT_CMS_LIST } from '../../graphql/queries';
import { type CmsSettingsData } from '../../settings/types/settingsTypes';

type ContentCmsListResponse = {
  contentCMSList: CmsSettingsData[];
};

type CmsAnalyticsSettings = Pick<
  CmsSettingsData,
  'googleAnalyticsPropertyId' | 'googleTrackingId'
>;

type UseCmsAnalyticsSettingsResult = {
  cms?: CmsSettingsData;
  hasAnalyticsSettings: boolean;
  loading: boolean;
};

export const hasSavedCmsAnalyticsSettings = (
  cms?: CmsAnalyticsSettings,
): boolean => {
  const trackingId = cms?.googleTrackingId?.trim();
  const propertyId = cms?.googleAnalyticsPropertyId?.trim();

  return Boolean(trackingId && propertyId);
};

export const useCmsAnalyticsSettings = (
  clientPortalId?: string,
): UseCmsAnalyticsSettingsResult => {
  const { data, loading } = useQuery<ContentCmsListResponse>(
    CONTENT_CMS_LIST,
    {
      fetchPolicy: 'cache-first',
      skip: !clientPortalId,
    },
  );

  const cms = useMemo(
    () =>
      data?.contentCMSList?.find(
        (item) => item.clientPortalId === clientPortalId,
      ),
    [clientPortalId, data?.contentCMSList],
  );

  return {
    cms,
    hasAnalyticsSettings: hasSavedCmsAnalyticsSettings(cms),
    loading: Boolean(clientPortalId && loading),
  };
};
