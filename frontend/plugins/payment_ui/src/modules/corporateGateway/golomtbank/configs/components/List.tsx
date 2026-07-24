import { useState } from 'react';
import { Button } from 'erxes-ui';
import { Card } from 'erxes-ui/components/card';
import { Dialog } from 'erxes-ui/components/dialog';

import ConfigForm from './Form';
import Row from './Row';
import { IGolomtBankConfigsItem } from '../../types/IConfigs';

type Props = {
  configs: IGolomtBankConfigsItem[];
  totalCount: number;
  loading: boolean;
  remove: (id: string) => void;
  refetch?: () => void;
};

const List = ({ configs, totalCount, loading, remove, refetch }: Props) => {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (values: any) => {
    if (refetch) await refetch();
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Golomt Bank Corporate Gateway
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your Golomt Bank integration settings.
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>+ Add Config</Button>
      </div>

      {/* Table */}
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
                <th className="py-2">Account ID</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config) => (
                <Row key={config._id} config={config} remove={remove} />
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.Header>
            <Dialog.Title>Add Golomt Bank Config</Dialog.Title>
          </Dialog.Header>

          <ConfigForm
            onSubmit={handleSubmit}
            closeModal={() => setOpen(false)}
          />
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

export default List;
