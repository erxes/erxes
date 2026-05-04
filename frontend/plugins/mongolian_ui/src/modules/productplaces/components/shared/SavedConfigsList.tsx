import { Card } from 'erxes-ui';

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
    <Card>
      <Card.Header>
        <div className="flex items-center justify-between">
          <Card.Title>Saved Configs</Card.Title>
          <span className="inline-flex items-center justify-center min-w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold px-2">
            {configs.length}
          </span>
        </div>
      </Card.Header>

      <Card.Content>
        <div className="grid gap-3">
          {configs.map((cfg, index) => (
            <button
              key={cfg._id || index}
              type="button"
              onClick={() => onSelect(index)}
              className={`w-full text-left rounded-lg border p-4 transition-all duration-200 ${
                index === activeIndex
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-muted hover:border-muted-foreground/20 hover:bg-muted/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-sm">
                    {cfg.title || '(Untitled config)'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    Stage: {cfg.stageId || '—'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
};

export default SavedConfigsList;
