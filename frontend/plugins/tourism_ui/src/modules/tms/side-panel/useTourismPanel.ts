import { useCallback, useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import {
  IOpenRecordOptions,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';
import { useBranchDetail } from '@/tms/hooks/BranchDetail';
import { ITourismPanelDraftDefaults } from '@/tms/side-panel/tourismPanelTypes';
import { useClearTourismDraftValues } from '@/tms/side-panel/useTourismDraftValues';

export const useTourismPanel = (contentType: string) => {
  const { openNewRecord, openRecord, close, back, canGoBack } = useSidePanel();
  const clearDraftValues = useClearTourismDraftValues();

  const openDraft = useCallback(
    (defaults: ITourismPanelDraftDefaults = {}) => {
      clearDraftValues(contentType);
      openNewRecord(contentType, defaults);
    },
    [openNewRecord, contentType, clearDraftValues],
  );

  const openDetail = useCallback(
    (contentId: string, options?: IOpenRecordOptions) => {
      if (options?.replace) {
        clearDraftValues(contentType);
      }

      openRecord({ contentType, contentId }, options);
    },
    [openRecord, contentType, clearDraftValues],
  );

  const cancelDraft = useCallback(() => {
    clearDraftValues(contentType);

    if (canGoBack) {
      back();
    } else {
      close();
    }
  }, [canGoBack, back, close, clearDraftValues, contentType]);

  const closePanel = useCallback(() => {
    clearDraftValues(contentType);
    close();
  }, [close, clearDraftValues, contentType]);

  return { openDraft, openDetail, cancelDraft, closePanel };
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
