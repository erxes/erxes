import { StatusAutomationCreate } from '@/status/components/StatusAutomationCreate';
import { StatusGroup } from '@/status/components/StatusGroup';
import { TICKET_STATUS_TYPES } from '@/status/constants';

const STATUS_TYPES = Object.values(TICKET_STATUS_TYPES);

export const Statuses = () => (
  <div className="flex flex-col">
    <div className="flex justify-end pb-4">
      <StatusAutomationCreate />
    </div>
    {STATUS_TYPES.map((statusType, index) => (
      <StatusGroup
        isLast={index === STATUS_TYPES.length - 1}
        key={statusType}
        statusType={statusType}
      />
    ))}
  </div>
);
