import { useAddSimilarity } from '../hooks/useAddSimilarity';
import { BulkProductSheetForm } from './BulkProductSheetForm';

interface BulkProductAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BulkProductAddSheet = ({
  open,
  onOpenChange,
}: BulkProductAddSheetProps) => {
  const { add, loading } = useAddSimilarity();

  return (
    <BulkProductSheetForm
      open={open}
      onOpenChange={onOpenChange}
      saving={loading}
      onSave={add}
    />
  );
};
