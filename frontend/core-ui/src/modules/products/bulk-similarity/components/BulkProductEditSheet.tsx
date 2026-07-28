import { useEditSimilarity } from '../hooks/useEditSimilarity';
import { IProductSimilarity } from '../types';
import { BulkProductSheetForm } from './BulkProductSheetForm';

interface BulkProductEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  similarity: IProductSimilarity;
}

export const BulkProductEditSheet = ({
  open,
  onOpenChange,
  similarity,
}: BulkProductEditSheetProps) => {
  const { edit, loading } = useEditSimilarity();

  return (
    <BulkProductSheetForm
      open={open}
      onOpenChange={onOpenChange}
      similarity={similarity}
      saving={loading}
      onSave={(doc) => edit(similarity._id, doc)}
    />
  );
};
