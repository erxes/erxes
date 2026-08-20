import { CellContext } from '@tanstack/react-table';
import { IconEdit } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { IIntegrationDetail } from '@/integrations/types/Integration';
import { CallProIntegrationAddSheet } from '@/integrations/callpro/components/CallProIntegrationAdd';
import { CallProIntegrationSheetEdit } from '@/integrations/callpro/components/CallProIntegrationEdit';
import { callProEditSheetAtom } from '@/integrations/callpro/states/callProEditSheetAtom';

export const CallProIntegrationDetail = () => {
  return (
    <div>
      <CallProIntegrationAddSheet />
      <CallProIntegrationSheetEdit />
    </div>
  );
};

export const CallProIntegrationActions = ({
  cell,
}: {
  cell: CellContext<IIntegrationDetail, unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const setEditId = useSetAtom(callProEditSheetAtom);

  return (
    <div
      onClick={() => setEditId(cell.row.original._id)}
      className="flex items-center gap-2 w-full"
    >
      <IconEdit size={16} />
      {t('edit')}
    </div>
  );
};
