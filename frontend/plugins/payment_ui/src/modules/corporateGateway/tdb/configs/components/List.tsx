import React, { useState } from 'react';
import { Button } from 'erxes-ui';
import { Card } from 'erxes-ui/components/card';
import { Dialog } from 'erxes-ui/components/dialog';
import Row from './Row';
import Form from './Form';
import { ITdbConfig } from '../types';

type Props = {
  configs: ITdbConfig[];
  totalCount: number;
  loading: boolean;
  remove: (id: string) => void;
  refetch?: () => void;
  addConfig: (doc: any) => void;
  editConfig: (id: string, doc: any) => void;
};

const List = ({
  configs,
  totalCount,
  loading,
  remove,
  refetch,
  addConfig,
  editConfig,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ITdbConfig | null>(null);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">TDB Corporate Gateway</h2>
          <p className="text-sm text-muted-foreground">
            Manage your TDB E-Commerce integration settings.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          + Add Config
        </Button>
      </div>

      <Card className="p-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : configs.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No configurations found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="py-2">Name</th>
                <th className="py-2">API URL</th>
                <th className="py-2">Username</th>
                <th className="py-2">Mode</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config) => (
                <Row
                  key={config._id}
                  config={config}
                  remove={remove}
                  onEdit={() => {
                    setEditing(config);
                    setOpen(true);
                  }}
                />
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (!val) setOpen(false);
        }}
      >
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.Header>
            <Dialog.Title>
              {editing ? 'Edit TDB Config' : 'Add TDB Config'}
            </Dialog.Title>
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

export default List;
