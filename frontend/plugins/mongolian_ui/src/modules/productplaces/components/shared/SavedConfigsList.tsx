type ConfigItem = {
  _id?: string;
  title?: string;
  stageId?: string;
};

type Props = {
  configs: ConfigItem[];
  activeIndex: number | null;
  onSelect: (index: number) => void;
};

const SavedConfigsList: React.FC<Props> = ({
  configs,
  activeIndex,
  onSelect,
}) => {
  if (!configs.length) return null;

  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground">
        Saved Configs
      </h3>

      <div className="space-y-3">
        {configs.map((cfg, index) => (
          <div
            key={cfg._id || index}
            onClick={() => onSelect(index)}
            className={`cursor-pointer rounded-lg border p-4 transition ${
              index === activeIndex
                ? 'border-primary bg-primary/5'
                : 'hover:bg-muted/40'
            }`}
          >
            <div className="font-medium">
              {cfg.title || '(Untitled config)'}
            </div>

            <div className="text-xs text-muted-foreground mt-1">
              Stage: {cfg.stageId || '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedConfigsList;
