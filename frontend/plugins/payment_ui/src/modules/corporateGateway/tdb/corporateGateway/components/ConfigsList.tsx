import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { Card } from 'erxes-ui/components/card';
import { Dialog } from 'erxes-ui/components/dialog';
import Form from '../../configs/components/Form';
import { ITdbConfig } from '../../configs/types';

type Props = {
  configs: ITdbConfig[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
  refetch?: () => void;
  addConfig: (doc: any) => void;
  editConfig: (id: string, doc: any) => void;
};

const ConfigsList = ({
  configs,
  totalCount,
  queryParams,
  loading,
  refetch,
  addConfig,
  editConfig,
}: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<string | undefined>(
    queryParams._id,
  );
  const [editing, setEditing] = useState<ITdbConfig | null>(null);

  const onClickConfig = (configId: string) => {
    setCurrentConfig(configId);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('_id', configId);
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  const handleSubmit = (doc: any) => {
    if (editing) {
      editConfig(editing._id, doc);
    } else {
      addConfig(doc);
    }
    if (refetch) refetch();
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-80 space-y-4">
        <Button className="w-full" onClick={() => { setEditing(null); setOpen(true); }}>
          + Add New Config
        </Button>

        {configs.length === 0 && !loading && (
          <div className="text-sm text-muted-foreground">No configurations yet.</div>
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
                {config.apiUrl}
              </div>
              {isActive && (
                <div className="mt-4">
                  {/* We can later add account list here */}
                  <div className="text-sm">Accounts will appear here</div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex-1">
        {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
        {currentConfig && (
          <div className="p-4">
            <h3 className="text-lg font-semibold">Config Details</h3>
            <p className="text-sm">Selected config ID: {currentConfig}</p>
            {/* Later we can show accounts, etc. */}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(val) => { if (!val) setOpen(false); }}>
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.Header>
            <Dialog.Title>{editing ? 'Edit TDB Config' : 'Add TDB Config'}</Dialog.Title>
          </Dialog.Header>
          <Form
            config={editing || undefined}
            onSubmit={handleSubmit}
            closeModal={() => setOpen(false)}
          />
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

export default ConfigsList;