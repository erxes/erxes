import { Badge, BadgeProps, RecordTableInlineCell } from 'erxes-ui';

export const LoyaltyStatusBadgeCell = ({
  status,
  variant = status === 'active' ? 'success' : 'secondary',
  className = 'uppercase',
  label = status || '—',
}: {
  status?: string;
  variant?: BadgeProps['variant'];
  className?: string;
  label?: string;
}) => (
  <RecordTableInlineCell>
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  </RecordTableInlineCell>
);
