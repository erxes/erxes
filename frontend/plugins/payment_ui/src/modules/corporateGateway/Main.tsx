import GolomtBankCard from './golomtbank/GolomtBankCard';
import KhanBankCard from './khanbank/KhanBankCard';

const CorporateGatewayMain = () => {
  return (
    <div className="space-y-4 p-4">
      <GolomtBankCard />
      <KhanBankCard />
    </div>
  );
};

export default CorporateGatewayMain;
