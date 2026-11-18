import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { useDealBroker } from '@/deals/components/deal-selects/hooks/useDealBroker';
import { rejectOnMutationError } from '@/deals/components/deal-selects/hooks/useOptimisticField';
import { IDealDetail } from '@/deals/types/deals';
import {
  IconBriefcase,
  IconBuilding,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { PanelField } from 'ui-modules';
import {
  DealPanelCompanyCell,
  DealPanelCustomerCell,
  DealPanelMemberCell,
  DealPanelOptionCell,
} from '~/widgets/record-panel/DealPanelCells';
import { toSingle } from '~/widgets/record-panel/useDealListField';

export const DealBrokerFields = ({
  type,
  id,
  onTypeChange,
  onIdChange,
}: {
  type: string;
  id: string;
  onTypeChange: (value: string) => void;
  onIdChange: (value: string) => void;
}) => {
  const { t } = useTranslation('sales');
  const setBrokerId = (value: string | string[]) => onIdChange(toSingle(value));
  const placeholder = t('select-broker');

  return (
    <>
      <PanelField icon={IconBriefcase} label={t('broker')}>
        <DealPanelOptionCell
          value={type || '_none'}
          options={[
            { value: '_none', label: t('none') },
            { value: 'customer', label: t('customer') },
            { value: 'company', label: t('company') },
            { value: 'user', label: t('user') },
          ]}
          onValueChange={onTypeChange}
        />
      </PanelField>
      {type === 'customer' && (
        <PanelField icon={IconUsers} label={t('customer')}>
          <DealPanelCustomerCell
            value={id}
            placeholder={placeholder}
            onValueChange={setBrokerId}
          />
        </PanelField>
      )}
      {type === 'company' && (
        <PanelField icon={IconBuilding} label={t('company')}>
          <DealPanelCompanyCell
            value={id}
            placeholder={placeholder}
            onValueChange={setBrokerId}
          />
        </PanelField>
      )}
      {type === 'user' && (
        <PanelField icon={IconUser} label={t('user')}>
          <DealPanelMemberCell
            mode="single"
            value={id}
            placeholder={placeholder}
            onValueChange={setBrokerId}
          />
        </PanelField>
      )}
    </>
  );
};

export const DealPanelBroker = ({ deal }: { deal: IDealDetail }) => {
  const { editDeals } = useDealsEdit();
  const broker = useDealBroker({
    deal,
    onCommit: (value) =>
      rejectOnMutationError(
        editDeals({
          variables: {
            _id: deal._id,
            brokerType: value.type || null,
            brokerId: value.id || null,
          },
        }),
      ),
  });

  return (
    <DealBrokerFields
      type={broker.type}
      id={broker.id}
      onTypeChange={broker.setType}
      onIdChange={broker.setId}
    />
  );
};
