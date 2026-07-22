import { Combobox, cn } from 'erxes-ui';

/**
 * Inline chip trigger for the deal detail row.
 *
 * `Combobox.TriggerBase` is deliberate: it keeps the outline border but renders
 * no chevron, which is how operation_ui builds its task detail chips. The shared
 * select roots use `Combobox.Trigger` (chevron included), so detail chips
 * compose Provider/Value/Content around this instead of reusing those roots.
 */
export const DealChipTrigger = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Combobox.TriggerBase className={cn('w-fit h-7 max-w-xs', className)}>
    {children}
  </Combobox.TriggerBase>
);
