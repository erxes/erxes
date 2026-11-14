import {
  usePagePanel,
  usePagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import { useQueryState } from 'erxes-ui';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { type TSegmentForm, useSegmentDetail } from 'ui-modules';

const searchOf = (contentType?: string) =>
  contentType ? `?${new URLSearchParams({ contentType })}` : '';

/**
 * A segment opened in the side panel or as its own page. Expanding the panel
 * carries any unsaved values along; a new segment stays open after creating
 * on the page and closes in the panel.
 */
export const useSegmentDetailPanel = (page: boolean) => {
  const [queryType] = useQueryState<string>('contentType');
  const [queryId, setOpen] = useQueryState<string>('segmentId');
  const { id } = useParams<{ id: string }>();
  const segmentId = page ? (id === 'new' ? '' : id) : queryId;
  const { segment, segmentLoading } = useSegmentDetail(segmentId || undefined);
  const contentType = queryType || segment?.contentType;
  const navigate = useNavigate();
  const location = useLocation();
  const state: { segmentDraft?: TSegmentForm } | null = location.state;
  const draft = useRef<(() => TSegmentForm) | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const search = searchOf(contentType);

  const openPage = useCallback(
    (recordId: string) =>
      navigate(`/segments/${encodeURIComponent(recordId)}${search}`),
    [navigate, search],
  );

  const pagePanel = usePagePanel({
    requiredPermission: segmentId ? undefined : 'segmentsManage',
    maxWidth: 1100,
    defaultWidth: 800,
    page,
    onExpand: () => {
      const params = new URLSearchParams({ contentType: contentType || '' });
      const tab = new URLSearchParams(location.search).get('tab');

      if (tab) {
        params.set('tab', tab);
      } else if (draft.current) {
        params.set('tab', 'definition');
      }

      navigate(
        `/segments/${encodeURIComponent(segmentId || 'new')}?${params}`,
        {
          state: { segmentDraft: draft.current?.() },
        },
      );
    },
    name: 'segments/SegmentDetail',
    open: page || (Boolean(contentType) && (!!segmentId || isCreatingNew)),
    onOpenChange: (open) => {
      if (page) {
        if (!open) {
          navigate(`/segments${search}`);
        }
        return;
      }

      if (open) {
        setIsCreatingNew(!segmentId);
        return;
      }

      setOpen(null);
      setIsCreatingNew(false);
    },
    identity: segmentId || 'new',
  });

  const onCreated = useCallback(
    (createdId: string) =>
      page ? openPage(createdId) : setIsCreatingNew(false),
    [page, openPage],
  );

  const onOpenExisting = useCallback(
    (existingId: string) => {
      if (page) {
        openPage(existingId);
        return;
      }

      setIsCreatingNew(false);
      setOpen(existingId);
    },
    [page, openPage, setOpen],
  );

  return {
    contentType,
    segmentId: segmentId || '',
    segmentLoading,
    pagePanel,
    draft,
    initialDraft: page ? state?.segmentDraft : undefined,
    startCreating: () => setIsCreatingNew(true),
    goToSegments: () => navigate('/segments'),
    onCreated,
    onOpenExisting,
  };
};

/** The segment shown in the panel: its title and the tab in view. */
export const useSegmentDetailBody = (segmentId: string) => {
  const { t } = useTranslation('segment');
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  const { segment, segmentLoading, unavailable, refetch } =
    useSegmentDetail(segmentId);
  const pagePanel = usePagePanelContext();

  // An unknown tab falls back to the first one shown
  const tabValueOf = useCallback(
    (tabs: { value: string }[]) =>
      tabs.some((tab) => tab.value === selectedTab)
        ? selectedTab || tabs[0].value
        : tabs[0].value,
    [selectedTab],
  );

  return {
    segment,
    refetch,
    pagePanel,
    isPending: segmentLoading || unavailable,
    segmentLoading,
    title: segmentId
      ? segment?.name || `${t('edit')} ${t('a-segment')}`
      : `${t('create')} ${t('a-segment')}`,
    expanded: pagePanel.expanded && Boolean(segmentId),
    tabValueOf,
    setSelectedTab,
  };
};
