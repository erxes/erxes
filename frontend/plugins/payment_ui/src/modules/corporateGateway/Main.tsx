import GolomtBankCard from './golomtbank/GolomtBankCard';
import KhanBankCard from './khanbank/KhanBankCard';
import TdbCard from './tdb/TdbCard';

const CorporateGatewayMain = () => {
  return (
    <div className="space-y-4 p-4">
      <GolomtBankCard />
      <KhanBankCard />
      <TdbCard />
    </div>
  );
};

export default CorporateGatewayMain;
