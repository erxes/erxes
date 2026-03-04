import { useState } from 'react';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import {
  InsuranceTypesHeader,
  InsuranceTypesFilter,
  InsuranceTypesRecordTable,
  InsuranceTypeForm,
} from '~/modules/insurance/components';
import { InsuranceType } from '~/modules/insurance/types';

export const InsuranceTypesPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<InsuranceType | undefined>();

  const handleEdit = (type: InsuranceType) => {
    setEditingType(type);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingType(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingType(undefined);
  };

  return (
    <PageContainer>
      <InsuranceTypesHeader onCreateClick={handleCreate} />
      <PageSubHeader>
        <InsuranceTypesFilter />
      </PageSubHeader>
      <InsuranceTypesRecordTable onEdit={handleEdit} />
      <InsuranceTypeForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        insuranceType={editingType}
      />
    </PageContainer>
  );
};
