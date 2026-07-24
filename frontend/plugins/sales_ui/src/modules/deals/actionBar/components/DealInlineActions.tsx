import {
  IconArchive,
  IconCopy,
  IconTrash,
} from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { DealPrintDocument } from '@/deals/actionBar/components/DealPrintDocument';
import { useDealActions } from '@/deals/actionBar/hooks/useDealActions';
import { IDeal } from '@/deals/types/deals';

export const DealInlineActions = ({ deal }: { deal: IDeal }) => {
  const { t } = useTranslation('sales');
  const {
    archiveLabel,
    handleArchive,
    handleCopy,
    handleRemove,
    isLoading,
    showRemove,
  } = useDealActions({ deals: [deal] });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1.5 px-2"
        onClick={() => void handleCopy()}
        disabled={isLoading}
      >
        <IconCopy />
        {t('duplicate')}
      </Button>
      <DealPrintDocument deals={[deal]} disabled={isLoading} />
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1.5 px-2"
        onClick={() => void handleArchive()}
        disabled={isLoading}
      >
        <IconArchive />
        {archiveLabel}
      </Button>
      {showRemove && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 px-2 text-red-700 hover:text-red-700"
          onClick={() => void handleRemove()}
          disabled={isLoading}
        >
          <IconTrash />
          {t('remove')}
        </Button>
      )}
    </>
  );
};
