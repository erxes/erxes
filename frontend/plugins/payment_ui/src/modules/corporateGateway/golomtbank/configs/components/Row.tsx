import { useState } from 'react';
import { Button } from 'erxes-ui';
import { Dialog } from 'erxes-ui/components/dialog';

import ConfigForm from './Form';
import { IGolomtBankConfigsItem } from '../../types/IConfigs';

type Props = {
  config: IGolomtBankConfigsItem;
  remove: (id: string) => void;
};

const Row = ({ config, remove }: Props) => {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    remove(config._id);
  };

  const handleSubmit = async () => {
    setOpen(false);
  };

  return (
    <>
      <tr className="border-b">
        <td className="py-3">
          <span className="font-medium">{config.accountId || '-'}</span>
        </td>

        <td className="py-3 text-right">
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              Edit
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-500"
            >
              Delete
            </Button>
          </div>
        </td>
      </tr>

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content className="sm:max-w-lg">
          <Dialog.Header>
            <Dialog.Title>Edit Golomt Bank Config</Dialog.Title>
          </Dialog.Header>

          <ConfigForm
            config={config}
            onSubmit={handleSubmit}
            closeModal={() => setOpen(false)}
          />
        </Dialog.Content>
      </Dialog>
    </>
  );
};

export default Row;
