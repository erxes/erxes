import { useLocation, useNavigate } from 'react-router-dom';
import { IKhanbankAccount } from '../types';

type Props = {
  queryParams: any;
  configId: string;
  accounts: IKhanbankAccount[];
};

const List = ({ queryParams, configId, accounts }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (iban: string) => {
    const searchParams = new URLSearchParams(location.search);

    searchParams.set('_id', configId);
    searchParams.set('account', iban);

    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  return (
    <div className="space-y-2">
      {(accounts || []).map((account) => {
        const isActive = queryParams.account === account.ibanAcctNo;

        return (
          <div
            key={account.ibanAcctNo}
            onClick={() => handleClick(account.ibanAcctNo)}
            className={`cursor-pointer rounded-lg p-3 border transition 
              ${isActive ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
          >
            <div className="text-sm font-medium">Данс: {account.number}</div>

            <div className="text-xs text-muted-foreground">
              IBAN: {account.ibanAcctNo}
            </div>

            <div className="text-xs text-muted-foreground mt-1">
              {account.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default List;
