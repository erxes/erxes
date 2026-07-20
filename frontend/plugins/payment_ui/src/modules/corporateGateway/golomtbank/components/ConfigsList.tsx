import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Sidebar, Empty } from 'erxes-ui';
import { IGolomtBankConfigsItem } from '../types/IConfigs';
import AccountRow from '../corporateGateway/accounts/components/Row';

type Props = {
  configs: IGolomtBankConfigsItem[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  refetch?: () => void;
};

const ConfigsList = ({ configs, totalCount, queryParams, loading }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const defaultAccount = JSON.parse(
      localStorage.getItem('golomtBankDefaultAccount') || '{}',
    );

    if (defaultAccount?.configId && defaultAccount?.accountNumber) {
      const params = new URLSearchParams(location.search);

      params.set('_id', defaultAccount.configId);
      params.set('account', defaultAccount.accountNumber);

      navigate(
        {
          pathname: location.pathname,
          search: params.toString(),
        },
        { replace: true },
      );
    }
  }, [navigate, location]);

  const handleAddConfig = () => {
    navigate('/settings/golomt-bank/create');
  };

  return (
    <Sidebar.Provider>
      <Sidebar variant="sidebar">
        {/* HEADER */}
        <Sidebar.Header>
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={handleAddConfig}
          >
            + Add New Config
          </Button>
        </Sidebar.Header>

        <Sidebar.Separator />

        {/* CONTENT */}
        <Sidebar.Content>
          {configs.map((config) => (
            <AccountRow
              key={config._id}
              {...config}
              account={{
                accountId: config.accountId,
                accountName: config.name, // mapped
                number: config.accountId, // mapped
              }}
              configId={config._id}
              queryParams={queryParams}
            />
          ))}

          {!loading && totalCount === 0 && (
            <Empty>
              <Empty.Header>
                <Empty.Title>No configs yet</Empty.Title>
                <Empty.Description>
                  Start by creating a new Golomt Bank corporate gateway
                  configuration.
                </Empty.Description>
              </Empty.Header>

              <Empty.Content>
                <Button onClick={handleAddConfig}>Add your first config</Button>
              </Empty.Content>
            </Empty>
          )}
        </Sidebar.Content>
      </Sidebar>
    </Sidebar.Provider>
  );
};

export default ConfigsList;
