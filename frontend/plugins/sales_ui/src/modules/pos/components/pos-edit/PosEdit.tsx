import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageContainer } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import { PosEditSidebar } from '@/pos/components/pos-edit/Sidebar';
import { MainContent } from '@/pos/components/pos-edit/MainContent';
import { usePosDetail } from '@/pos/hooks/usePosDetail';

interface PosEditProps {
  id?: string;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
}

export const PosEdit = ({ id, breadcrumbs, actions }: PosEditProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { posDetail, loading, error } = usePosDetail(id);
  const [saveAction, setSaveAction] = useState<ReactNode | null>(null);

  const activeTab = searchParams.get('activeTab') || 'properties';

  const handleSaveActionChange = useCallback((action: ReactNode | null) => {
    setSaveAction(action);
  }, []);

  useEffect(() => {
    if (!searchParams.get('activeTab')) {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set('activeTab', 'properties');
          return newParams;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);

  return (
    <PageContainer className="flex-row">
      <PosEditSidebar activeTab={activeTab} posId={id} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <SettingsHeader breadcrumbs={breadcrumbs}>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {actions}
          </div>
        </SettingsHeader>
        <MainContent
          activeStep={activeTab}
          posId={id}
          posDetail={posDetail}
          loading={loading}
          error={error}
          onSaveActionChange={handleSaveActionChange}
          saveAction={saveAction}
        />
      </div>
    </PageContainer>
  );
};
