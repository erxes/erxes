import {
  AutomationNodeMetaInfoRow,
  AutomationTriggerConfigProps,
} from 'ui-modules';
import {
  POS_ORDER_EVENT_OPTIONS,
  POS_ORDER_STATUS_OPTIONS,
  POS_ORDER_TYPE_OPTIONS,
} from '../../constants/configForm';
import { TPosOrderEventTriggerConfigForm } from '../../states/posOrderEventTriggerConfigFormDefinitions';

const getOptionLabel = (
  options: Array<{ value: string; label: string }>,
  value?: string,
) => options.find((option) => option.value === value)?.label || value || '';

export const PosOrderEventTriggerNodeContent = ({
  config,
}: AutomationTriggerConfigProps<TPosOrderEventTriggerConfigForm>) => {
  const { eventType, fromStatus, toStatus, orderType, paymentType, posId } =
    config || {};

  return (
    <div>
      <AutomationNodeMetaInfoRow
        fieldName="When POS order event is"
        content={getOptionLabel(POS_ORDER_EVENT_OPTIONS, eventType)}
      />
      {eventType === 'statusChanged' && (
        <AutomationNodeMetaInfoRow
          fieldName="Status"
          content={`${
            getOptionLabel(POS_ORDER_STATUS_OPTIONS, fromStatus) || 'Any'
          } -> ${getOptionLabel(POS_ORDER_STATUS_OPTIONS, toStatus) || 'Any'}`}
        />
      )}
      {posId && (
        <AutomationNodeMetaInfoRow fieldName="POS ID" content={posId} />
      )}
      {orderType && (
        <AutomationNodeMetaInfoRow
          fieldName="Order type"
          content={getOptionLabel(POS_ORDER_TYPE_OPTIONS, orderType)}
        />
      )}
      {paymentType && (
        <AutomationNodeMetaInfoRow
          fieldName="Payment type"
          content={paymentType}
        />
      )}
    </div>
  );
};
