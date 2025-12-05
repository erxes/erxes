import { InfoCard } from 'erxes-ui';
import { PaymentConfiguration } from './PaymentConfiguration';
import { OtherPayment } from './OtherPayment';
import { isFieldVisible } from '../../constants';

interface PaymentProps {
  posId?: string;
  posType?: string;
}

const Payment: React.FC<PaymentProps> = ({ posId, posType }) => {
  return (
    <div className="overflow-y-auto p-6 space-y-6 min-h-screen">
      <InfoCard title="Payment Configuration">
        <InfoCard.Content>
          <PaymentConfiguration posId={posId} posType={posType} />
        </InfoCard.Content>
      </InfoCard>

      {isFieldVisible('addCustomPayment', posType) && (
        <InfoCard title="Other Payment">
          <InfoCard.Content>
            <OtherPayment posId={posId} />
          </InfoCard.Content>
        </InfoCard>
      )}
    </div>
  );
};

export default Payment;
