import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { Card } from 'erxes-ui/components/card';
import { Dialog } from 'erxes-ui/components/dialog';

import Form from '../../configs/components/Form';
import { IKhanbankConfigsItem } from '../../configs/types';
import AccountList from '../accounts/containers/List';

type Props = {
  configs: IKhanbankConfigsItem[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  refetch?: () => void;
};

const ConfigsList = ({
  configs,
  totalCount,
  queryParams,
  loading,
  refetch,
}: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<string | undefined>(
    queryParams._id,
  );

  useEffect(() => {
    const defaultAccount = JSON.parse(
      localStorage.getItem('khanbankDefaultAccount') || '{}',
    );

    if (defaultAccount.configId && defaultAccount.accountNumber) {
      const searchParams = new URLSearchParams(location.search);

      searchParams.set('_id', defaultAccount.configId);
      searchParams.set('account', defaultAccount.accountNumber);

      navigate(`${location.pathname}?${searchParams.toString()}`);
    }
  }, []);

  const onClickConfig = (configId: string) => {
    setCurrentConfig(configId);

    const searchParams = new URLSearchParams(location.search);
    searchParams.set('_id', configId);

    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-80 space-y-4">
        <Button className="w-full" onClick={() => setOpen(true)}>
          + Add New Config
        </Button>

        {configs.length === 0 && !loading && (
          <div className="text-sm text-muted-foreground">
            No configurations yet.
          </div>
        )}

        {configs.map((config) => {
          const isActive = currentConfig === config._id;

          return (
            <Card
              key={config._id}
              className={`p-4 cursor-pointer transition ${
                isActive ? 'border-primary bg-primary/10' : 'hover:bg-muted'
              }`}
              onClick={() => onClickConfig(config._id)}
            >
              <div className="font-medium">{config.name}</div>

              <div className="text-xs text-muted-foreground mt-1">
                Click to view accounts
              </div>

              {isActive && (
                <div className="mt-4">
                  <AccountList
                    configId={config._id}
                    queryParams={queryParams}
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Right side content placeholder (optional future expansion) */}
      <div className="flex-1">
        {loading && (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.Header>
            <Dialog.Title>Add Khan Bank Config</Dialog.Title>
          </Dialog.Header>

          <Form closeModal={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

export default ConfigsList;
