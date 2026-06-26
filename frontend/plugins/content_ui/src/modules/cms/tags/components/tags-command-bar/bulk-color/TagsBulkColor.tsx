import { useState } from 'react';
import { Button, Popover, RecordTable, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBulkEditTags } from '../../../hooks/useBulkEditTags';

const PRESET_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#6366F1',
  '#84CC16',
];

export const TagsBulkColor = () => {
  const { t } = useTranslation('content');
  const [open, setOpen] = useState(false);
  const [colorValue, setColorValue] = useState('#3B82F6');
  const { table } = RecordTable.useRecordTable();
  const { bulkEditTags, loading } = useBulkEditTags();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((r: any) => r.original._id as string);

  const handleApply = async (color: string) => {
    try {
      await bulkEditTags(selectedIds, { colorCode: color });
      setOpen(false);
      toast({ title: t('success'), variant: 'default' });
    } catch (e: any) {
      toast({ title: t('error'), description: e.message, variant: 'destructive' });
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setColorValue('#3B82F6');
      }}
    >
      <Popover.Trigger asChild>
        <Button variant="secondary" size="sm" disabled={loading}>
          {t('color')}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" side="top" sideOffset={10} className="w-[220px] p-3">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium">{t('color')}</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className="size-6 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: colorValue === c ? 'hsl(var(--foreground))' : 'transparent',
                }}
                onClick={() => handleApply(c)}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorValue}
              onChange={(e) => setColorValue(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-input"
            />
            <span className="text-xs text-muted-foreground font-mono">{colorValue}</span>
          </div>
          <Button size="sm" disabled={loading} onClick={() => handleApply(colorValue)}>
            {t('apply')}
          </Button>
        </div>
      </Popover.Content>
    </Popover>
  );
};
