import { useCallback } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import {
  IOpenRecordOptions,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';
import { IContentPanelDraftDefaults } from '@/cms/shared/side-panel/contentPanelTypes';

export const useContentPanel = (contentType: string) => {
  const { openNewRecord, openRecord, close, back, canGoBack } = useSidePanel();

  const openDraft = useCallback(
    (defaults: IContentPanelDraftDefaults = {}) =>
      openNewRecord(contentType, defaults),
    [openNewRecord, contentType],
  );

  const openDetail = useCallback(
    (contentId: string, options?: IOpenRecordOptions) =>
      openRecord({ contentType, contentId }, options),
    [openRecord, contentType],
  );

  const cancelDraft = useCallback(
    () => (canGoBack ? back() : close()),
    [canGoBack, back, close],
  );

  return { openDraft, openDetail, cancelDraft, closePanel: close };
};

const CMS_WEBSITE_ROUTE = '/content/cms/:websiteId/*';

export const useContentPanelWebsiteId = () => {
  const { pathname } = useLocation();

  return matchPath(CMS_WEBSITE_ROUTE, pathname)?.params.websiteId || '';
};

export const useContentPanelDraft = (contentType: string) => {
  const defaults = useSidePanelDraft<IContentPanelDraftDefaults>(contentType);
  const routeWebsiteId = useContentPanelWebsiteId();

  return {
    ...defaults,
    clientPortalId: defaults.clientPortalId || routeWebsiteId,
  };
};
