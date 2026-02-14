import { useState, useEffect } from 'react';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { useRiskTypes } from '~/modules/insurance/hooks';
import {
  RiskTypeForm,
  RisksHeader,
  RisksRecordTable,
  RisksFilter,
} from '~/modules/insurance/components';
import { RiskType } from '~/modules/insurance/types';

export const RiskTypesPage = () => {
  const { refetch } = useRiskTypes();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskType | undefined>();

  useEffect(() => {
    const handleEditRisk = (event: CustomEvent<RiskType>) => {
      setEditingRisk(event.detail);
      setIsFormOpen(true);
    };

    window.addEventListener('edit-risk-type', handleEditRisk as EventListener);
    return () => {
      window.removeEventListener(
        'edit-risk-type',
        handleEditRisk as EventListener,
      );
    };
  }, []);

  const handleCreate = () => {
    setEditingRisk(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingRisk(undefined);
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <PageContainer>
      <RisksHeader onCreateClick={handleCreate} />
      <PageSubHeader>
        <RisksFilter />
      </PageSubHeader>
      <RisksRecordTable />

      <RiskTypeForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        riskType={editingRisk}
        onSuccess={handleSuccess}
      />
    </PageContainer>
  );
};
