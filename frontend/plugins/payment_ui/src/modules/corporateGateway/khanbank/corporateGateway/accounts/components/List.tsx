import { useLocation, useNavigate } from 'react-router-dom';
import { IKhanbankAccount } from '../types';
import { Button } from 'erxes-ui/components/button';
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
    <Button
  key={account.ibanAcctNo}
  variant="ghost"
  className={`w-full h-auto justify-start p-3 border rounded-lg
    ${isActive ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
  onClick={() => handleClick(account.ibanAcctNo)}
>
  <div className="text-left">
    <div className="text-sm font-medium">Данс: {account.number}</div>

    <div className="text-xs text-muted-foreground">
      IBAN: {account.ibanAcctNo}
    </div>

    <div className="text-xs text-muted-foreground mt-1">
      {account.name}
    </div>
  </div>
</Button>
  );
};

export default List;
