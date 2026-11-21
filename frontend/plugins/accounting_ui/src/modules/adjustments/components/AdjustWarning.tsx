/**
 * The saved run warning of an adjustment, e.g. the unsettled transaction
 * that stopped it. Renders nothing without a warning.
 */
export const AdjustWarning = ({ warning }: { warning?: string | null }) =>
  warning ? <div className="text-sm text-warning">{warning}</div> : null;
