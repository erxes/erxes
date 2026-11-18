import { IconArrowLeft, IconCopy, IconTrash } from '@tabler/icons-react';
import { Button, ColorPicker, Input, Label, ScrollArea } from 'erxes-ui';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSlotSize } from '@/pos/slot/slotNodes';
import type { SlotNode, SlotNodePatch } from '@/pos/slot/types';

interface SlotInspectorProps {
  node: SlotNode;
  onChange: (patch: SlotNodePatch) => void;
  onBack: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const NumberField = ({
  label,
  value,
  min,
  suffix,
  onCommit,
}: {
  label: string;
  value: number;
  min?: number;
  suffix?: string;
  onCommit: (value: number) => void;
}) => {
  const id = useId();
  const [draft, setDraft] = useState(String(Math.round(value)));

  useEffect(() => setDraft(String(Math.round(value))), [value]);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          value={draft}
          className={suffix ? 'pr-7' : undefined}
          onChange={(event) => {
            setDraft(event.target.value);
            const next = Number(event.target.value);
            if (event.target.value !== '' && Number.isFinite(next)) {
              onCommit(Math.round(next));
            }
          }}
          onBlur={() => setDraft(String(Math.round(value)))}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

const InspectorGroup = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3 border-t px-4 py-4">
    <h4 className="text-xs font-medium text-muted-foreground">{title}</h4>
    <div className="grid grid-cols-2 gap-3">{children}</div>
  </div>
);

export const SlotInspector = ({
  node,
  onChange,
  onBack,
  onDuplicate,
  onDelete,
}: SlotInspectorProps) => {
  const { t } = useTranslation('sales');
  const nameId = useId();
  const { width, height } = getSlotSize(node);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center gap-1 border-b px-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('back')}
          onClick={onBack}
        >
          <IconArrowLeft />
        </Button>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {t('slot-detail')}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('duplicate')}
          onClick={onDuplicate}
        >
          <IconCopy />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive"
          aria-label={t('delete')}
          onClick={onDelete}
        >
          <IconTrash />
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 px-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor={nameId}>{t('name')}</Label>
            <Input
              id={nameId}
              value={node.data.name}
              onChange={(event) => onChange({ name: event.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('code')}</Label>
              <p className="flex h-7 items-center text-sm text-muted-foreground">
                #{node.data.code}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>{t('color')}</Label>
              <ColorPicker
                value={node.data.color}
                onValueChange={(color) => onChange({ color })}
                className="h-7 w-full"
              />
            </div>
          </div>
        </div>

        <InspectorGroup title={t('slots-size', 'Size')}>
          <NumberField
            label={t('slots-width', 'Width')}
            value={width}
            min={40}
            onCommit={(value) => onChange({ width: value })}
          />
          <NumberField
            label={t('height')}
            value={height}
            min={40}
            onCommit={(value) => onChange({ height: value })}
          />
        </InspectorGroup>

        <InspectorGroup title={t('slots-position', 'Position')}>
          <NumberField
            label="X"
            value={node.position.x}
            min={0}
            onCommit={(value) => onChange({ x: value })}
          />
          <NumberField
            label="Y"
            value={node.position.y}
            min={0}
            onCommit={(value) => onChange({ y: value })}
          />
        </InspectorGroup>

        <InspectorGroup title={t('slots-appearance', 'Appearance')}>
          <NumberField
            label={t('rotate-angle')}
            value={node.data.rotateAngle}
            suffix="°"
            onCommit={(value) => onChange({ rotateAngle: value })}
          />
          <NumberField
            label={t('rounded')}
            value={node.data.rounded}
            min={0}
            onCommit={(value) => onChange({ rounded: Math.max(0, value) })}
          />
          <NumberField
            label={t('z-index')}
            value={node.zIndex ?? 0}
            onCommit={(value) => onChange({ zIndex: value })}
          />
        </InspectorGroup>
      </ScrollArea>
    </div>
  );
};
