import { Button } from 'erxes-ui';

type Props = {
  title: string;
  onNew: () => void;
  disabled?: boolean;
};

const ConfigHeader: React.FC<Props> = ({ title, onNew, disabled }) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Button variant="outline" onClick={onNew} disabled={disabled}>
        + New Config
      </Button>
    </div>
  );
};

export default ConfigHeader;
