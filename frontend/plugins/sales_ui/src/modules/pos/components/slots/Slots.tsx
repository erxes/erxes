import { usePosSlots } from '@/pos/hooks/usePosSlots';
import { SlotEditor } from '@/pos/slot/components/SlotEditor';
import { useTranslation } from 'react-i18next';

interface SlotsProps {
  posId: string;
  onSaveActionChange?: (action: React.ReactNode | null) => void;
}

export const Slots = ({ posId, onSaveActionChange }: SlotsProps) => {
  const { t } = useTranslation('sales');
  const { slots, loading, error, saving, saveSlots } = usePosSlots(posId);

  if (loading) {
    return <div className="h-full animate-pulse rounded-lg bg-muted" />;
  }

  if (error || !slots) {
    return (
      <p className="p-6 text-center text-destructive">
        {t('failed-to-load-slots')}
        {error ? `: ${error.message}` : null}
      </p>
    );
  }

  return (
    <SlotEditor
      savedSlots={slots}
      saving={saving}
      onSave={saveSlots}
      onSaveActionChange={onSaveActionChange}
    />
  );
};
