import { InfoCard } from 'erxes-ui';
import { LogosAndFavicon } from '@/pos/components/appearance/LogosAndFavicon';
import { MainColors } from '@/pos/components/appearance/MainColors';
import { Infos } from '@/pos/components/appearance/Infos';
import { isFieldVisible } from '@/pos/constants';

interface AppearanceProps {
  posId?: string;
  posType?: string;
}

const Appearance: React.FC<AppearanceProps> = ({ posId, posType }) => {
  return (
    <div className="overflow-y-auto p-6 space-y-6 min-h-screen">
      <InfoCard title="Logos and favicon">
        <InfoCard.Content>
          <LogosAndFavicon posId={posId} posType={posType} />
        </InfoCard.Content>
      </InfoCard>

      {isFieldVisible('mainColors', posType) && (
        <InfoCard title="Main colors">
          <InfoCard.Content>
            <MainColors posId={posId} />
          </InfoCard.Content>
        </InfoCard>
      )}

      {isFieldVisible('websitePhone', posType) && (
        <InfoCard title="Infos">
          <InfoCard.Content>
            <Infos posId={posId} />
          </InfoCard.Content>
        </InfoCard>
      )}
    </div>
  );
};

export default Appearance;
