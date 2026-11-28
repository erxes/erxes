import { Dialog } from 'erxes-ui';
import { CopyField } from './CopyField';

/** A secret or key the API returns once: shown in a dialog to copy now. */
export const ShownOnce = ({
  value,
  title,
  description,
  onClose,
}: {
  value: string;
  title: string;
  description: string;
  onClose: () => void;
}) => (
  <Dialog open onOpenChange={(open) => !open && onClose()}>
    <Dialog.Content>
      <Dialog.HeaderCombined title={title} description={description} />
      <CopyField value={value} label={title} />
    </Dialog.Content>
  </Dialog>
);
