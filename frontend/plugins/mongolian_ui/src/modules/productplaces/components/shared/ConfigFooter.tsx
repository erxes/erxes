import { Button } from 'erxes-ui';

type Props = {
  activeIndex: number | null;
  loading: boolean;
  onClear: () => void;
  onSave: () => void;
  onDelete: () => void;
};

const ConfigFooter: React.FC<Props> = ({
  activeIndex,
  loading,
  onClear,
  onSave,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-between py-6 border-t">
      {activeIndex !== null && (
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={loading}
          className="text-xs"
        >
          Delete Config
        </Button>
      )}
      <div className="flex gap-3 ml-auto">
        <Button
          variant="outline"
          onClick={onClear}
          disabled={loading}
          className="text-xs"
        >
          Clear
        </Button>
        <Button onClick={onSave} disabled={loading} className="text-xs">
          {loading ? 'Saving...' : 'Save Config'}
        </Button>
      </div>
    </div>
  );
};

export default ConfigFooter;
