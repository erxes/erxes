import { useCallback, useMemo } from 'react';
import { useSetAtom } from 'jotai';
import { matchPath, useLocation } from 'react-router-dom';
import {
  IOpenRecordOptions,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';
import { useBranchDetail } from '@/tms/hooks/BranchDetail';
import { ITourismPanelDraftDefaults } from '@/tms/side-panel/tourismPanelTypes';
import { tourismDraftValuesState } from '@/tms/side-panel/useTourismDraftValues';

export const useTourismPanel = (contentType: string) => {
  const { openNewRecord, openRecord, close, back, canGoBack } = useSidePanel();
  const setDraftValues = useSetAtom(tourismDraftValuesState);

  const openDraft = useCallback(
    (defaults: ITourismPanelDraftDefaults = {}) => {
      setDraftValues((previous) => ({ ...previous, [contentType]: undefined }));
      openNewRecord(contentType, defaults);
    },
    [openNewRecord, contentType, setDraftValues],
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

const TMS_BRANCH_ROUTE = '/tourism/tms/branches/:branchId/*';

export const useTourismPanelRouteBranchId = () => {
  const { pathname } = useLocation();

  return matchPath(TMS_BRANCH_ROUTE, pathname)?.params.branchId || '';
};

export const useTourismPanelBranch = (branchId?: string) => {
  const routeBranchId = useTourismPanelRouteBranchId();
  const id = branchId || routeBranchId;
  const { branchDetail, loading } = useBranchDetail({ id });

  const branchLanguages = useMemo(
    () => branchDetail?.languages || [],
    [branchDetail?.languages],
  );

  return {
    branchId: id,
    branch: branchDetail,
    branchLanguages,
    mainLanguage: branchDetail?.language,
    loading,
  };
};

export const useTourismPanelDraft = (contentType: string) => {
  const defaults = useSidePanelDraft<ITourismPanelDraftDefaults>(contentType);
  const routeBranchId = useTourismPanelRouteBranchId();

  return {
    ...defaults,
    branchId: defaults.branchId || routeBranchId,
  };
};
