import { Badge, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  getStructureSeatCoverageLabel,
  getStructureSeatCoveredTitles,
  IStructureSeatCoverageSource,
} from '../utils/structureSeatCoverage';

export const StructureSeatCoverageBadge = ({
  seat,
  className,
}: {
  seat: IStructureSeatCoverageSource;
  className?: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const label = getStructureSeatCoverageLabel(seat, t);
  const variant = seat.coverage === 'node' ? 'secondary' : 'info';

  if (seat.coverage !== 'selected') {
    return (
      <Badge variant={variant} className={className}>
        {label}
      </Badge>
    );
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Badge variant={variant} className={className}>
            {label}
          </Badge>
        </Tooltip.Trigger>
        <Tooltip.Content className="max-w-xs">
          {getStructureSeatCoveredTitles(seat).join(', ')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
