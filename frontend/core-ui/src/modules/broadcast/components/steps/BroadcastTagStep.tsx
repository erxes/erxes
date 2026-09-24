import { BroadcastTagChooser } from '../chooser/BroadcastTagChooser';

export const BroadcastTagStep = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) => <BroadcastTagChooser value={value} onChange={onChange} />;
