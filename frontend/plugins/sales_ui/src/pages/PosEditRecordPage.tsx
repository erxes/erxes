import { IconCashRegister } from '@tabler/icons-react';
import { Breadcrumb, Button, PageContainer } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  type ISidePanelDraft,
  type ISidePanelNavigator,
  NEW_RECORD_ID,
  RecordPageMinimize,
  SettingsHeader,
  SidePanelDraftContext,
  SidePanelNavigatorContext,
  sidePanelDraftState,
  useSidePanel,
} from 'ui-modules';
import { getPosEditRecordPage } from '@/pos/constants/posPanel';
import { RecordPanel } from '~/widgets/record-panel/RecordPanel';

const keepTab = () => undefined;

export const PosEditRecordPage = () => {
  const { t } = useTranslation('sales');
  const {
    id: posId = '',
    recordType = '',
    recordKey = '',
  } = useParams<{ id: string; recordType: string; recordKey: string }>();
  const navigate = useNavigate();
  const { openRecord } = useSidePanel();
  const setDraft = useSetAtom(sidePanelDraftState);
  const page = useMemo(() => getPosEditRecordPage(recordType), [recordType]);
  const listPath = page
    ? `/sales/settings/pos/${posId}?tab=${page.tab}`
    : `/sales/settings/pos/${posId}`;

  const draft = useMemo<ISidePanelDraft | null>(
    () =>
      page
        ? {
            contentType: page.contentType,
            defaults: { posId, [page.keyField]: recordKey },
          }
        : null,
    [page, posId, recordKey],
  );

  const navigator = useMemo<ISidePanelNavigator | null>(() => {
    if (!page) {
      return null;
    }

    const backToList = () => navigate(listPath);

    return {
      record: { contentType: page.contentType, contentId: NEW_RECORD_ID },
      tab: '',
      setTab: keepTab,
      openRecord,
      back: backToList,
      canGoBack: false,
      close: backToList,
      listPath,
    };
  }, [page, listPath, navigate, openRecord]);

  useEffect(() => {
    if (draft) {
      setDraft(draft);
    }
  }, [draft, setDraft]);

  if (!page || !draft || !navigator) {
    return <Navigate to={listPath} replace />;
  }

  return (
    <PageContainer>
      <SidePanelNavigatorContext.Provider value={navigator}>
        <SidePanelDraftContext.Provider value={draft}>
          <SettingsHeader
            breadcrumbs={
              <Breadcrumb>
                <Breadcrumb.List className="gap-2">
                  <Breadcrumb.Item>
                    <Button variant="ghost" asChild>
                      <Link to={listPath}>
                        <IconCashRegister />
                        {t('pos')}
                      </Link>
                    </Button>
                  </Breadcrumb.Item>
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <Breadcrumb.Page>
                      <RecordPanel
                        contentType={page.contentType}
                        contentId={NEW_RECORD_ID}
                        view="title"
                      />
                    </Breadcrumb.Page>
                  </Breadcrumb.Item>
                </Breadcrumb.List>
              </Breadcrumb>
            }
          >
            <div className="ml-auto">
              <RecordPageMinimize />
            </div>
          </SettingsHeader>
          <div className="flex min-h-0 flex-1">
            <div className="flex min-h-0 w-full shrink-0 flex-col border-r bg-background md:w-96">
              <RecordPanel
                contentType={page.contentType}
                contentId={NEW_RECORD_ID}
                view="new"
              />
            </div>
          </div>
        </SidePanelDraftContext.Provider>
      </SidePanelNavigatorContext.Provider>
    </PageContainer>
  );
};
