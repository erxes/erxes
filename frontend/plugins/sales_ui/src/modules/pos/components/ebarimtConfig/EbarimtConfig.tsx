import { InfoCard } from 'erxes-ui';
import { Main } from './Main';
import { Other } from './Other';
import { Vat } from './Vat';
import { UbCityTax } from './UbCityTax';
import { UiConfig } from './UiConfig';
import { isFieldVisible } from '../../constants';

interface EbarimtConfigProps {
  posId?: string;
  posType?: string;
}

const EbarimtConfig: React.FC<EbarimtConfigProps> = ({ posId, posType }) => {
  return (
    <div className="overflow-y-auto p-6 space-y-6 min-h-screen">
      {isFieldVisible('ebarimtSetup', posType) && (
        <>
          <InfoCard title="Main">
            <InfoCard.Content>
              <Main posId={posId} />
            </InfoCard.Content>
          </InfoCard>

          <InfoCard title="Other">
            <InfoCard.Content>
              <Other posId={posId} />
            </InfoCard.Content>
          </InfoCard>

          <InfoCard title="Vat">
            <InfoCard.Content>
              <Vat posId={posId} />
            </InfoCard.Content>
          </InfoCard>

          <InfoCard title="Ub City Tax">
            <InfoCard.Content>
              <UbCityTax posId={posId} />
            </InfoCard.Content>
          </InfoCard>

          <InfoCard title="Ui Config">
            <InfoCard.Content>
              <UiConfig posId={posId} />
            </InfoCard.Content>
          </InfoCard>
        </>
      )}
    </div>
  );
};

export default EbarimtConfig;
