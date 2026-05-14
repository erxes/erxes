import { Button } from 'erxes-ui';

type Props = {
  title: string;
  onNew: () => void;
  disabled?: boolean;
};

const ConfigHeader: React.FC<Props> = ({ title, onNew, disabled }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Manage product placement configurations for different stages
        </p>
      </div>
      <Button
        onClick={onNew}
        disabled={disabled}
        className="text-sm"
      >
        + New Config
      </Button>
    </div>
  );
};

export default ConfigHeader;
