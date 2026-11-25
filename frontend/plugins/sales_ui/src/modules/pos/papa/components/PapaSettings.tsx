import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { useQuery } from '@apollo/client';
import { InfoCard } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SALES_PAPA_CONFIG } from '../graphql/papaDocuments';
import { PapaAccountForm } from './PapaAccountForm';
import { PapaPosForm } from './PapaPosForm';

/** Papa Logistic section of a POS's delivery settings. */
export const PapaSettings = ({ posId }: { posId?: string }) => {
  const { t } = useTranslation('sales');
  const { posDetail } = usePosDetail(posId);
  const { data } = useQuery(SALES_PAPA_CONFIG);
  const hasAccount = !!data?.salesPapaConfig?.staffId;

  return (
    <div className="space-y-6 px-6 pb-6">
      <InfoCard title={t('papa-account', 'Papa Logistic account')}>
        <InfoCard.Content>
          <PapaAccountForm />
        </InfoCard.Content>
      </InfoCard>
      {posId && (
        <InfoCard title={t('papa-pos-settings', 'Papa delivery for this POS')}>
          <InfoCard.Content>
            <PapaPosForm
              posId={posId}
              deliveryConfig={posDetail?.deliveryConfig}
              hasAccount={hasAccount}
            />
          </InfoCard.Content>
        </InfoCard>
      )}
    </div>
  );
};
