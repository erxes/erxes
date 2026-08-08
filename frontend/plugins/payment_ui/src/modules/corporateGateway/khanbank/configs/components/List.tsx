import { useState } from 'react';
import { Button } from 'erxes-ui';
import { Card } from 'erxes-ui/components/card';
import { Dialog } from 'erxes-ui/components/dialog';

import ConfigForm from './Form';
import Row from './Row';
import { IKhanbankConfigsItem } from '../types';

type Props = {
  configs: IKhanbankConfigsItem[];
  loading: boolean;
  remove: (id: string) => void;
  refetch?: () => void;
};

const List = ({ configs, loading, remove, refetch }: Props) => {
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (refetch) {
      refetch();
    }

    setOpen(false);
  };

  let content;

  if (loading) {
    content = <p className="text-sm text-muted-foreground">Loading...</p>;
  } else if (configs.length === 0) {
    content = (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No configurations found.
      </div>
    );
  } else {
    content = (
      <table className="w-full text-sm">
        <thead className="border-b text-muted-foreground">
          <tr className="text-left text-sm font-medium">
            <th className="py-2">Name</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {configs.map((config) => (
            <Row
              key={config._id}
              config={config}
              remove={remove}
              refetch={refetch}
            />
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium">Khan Bank Corporate Gateway</h2>
          <p className="text-sm font-normal text-muted-foreground">
            Manage your Khan Bank integration settings.
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>+ Add Config</Button>
      </div>

      <Card className="p-4">{content}</Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.Header>
            <Dialog.Title>Add Khan Bank Config</Dialog.Title>
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
