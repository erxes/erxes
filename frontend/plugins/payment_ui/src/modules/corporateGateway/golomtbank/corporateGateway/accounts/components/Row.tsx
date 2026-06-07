import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from 'erxes-ui/components/sidebar';

export default function AccountRow({
  account,
  configId,
  queryParams,
}: {
  account: {
    accountId: string;
    accountName: string;
    number: string;
  };
  configId: string;
  queryParams: any;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = queryParams.account === account.accountId;

  const handleClick = () => {
    const params = new URLSearchParams(location.search);

    params.set('_id', configId);
    params.set('account', account.accountId);

    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: false },
    );
  };

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton isActive={isActive} onClick={handleClick}>
        <span className="truncate">{account.accountId}</span>
        <span className="ml-auto text-xs text-muted-foreground truncate">
          {account.accountName}
        </span>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
}
