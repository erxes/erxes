import { Button } from 'erxes-ui';

interface JSONRawEditorProps {
  isOpen: boolean;
  value: string;
  onToggle: () => void;
  onApply: () => void;
  onChange: (value: string) => void;
}

export function JSONRawEditor({
  isOpen,
  value,
  onToggle,
  onApply,
  onChange,
}: JSONRawEditorProps) {
  return (
    <div className="mt-2 border rounded-md p-2 bg-muted/30">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] text-muted-foreground">JSON summary</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onToggle}>
            {isOpen ? 'Hide raw' : 'Edit raw'}
          </Button>
          {isOpen && (
            <Button size="sm" onClick={onApply}>
              Apply
            </Button>
          )}
        </div>
      </div>

      {isOpen ? (
        <textarea
          className="w-full h-40 text-[11px] font-mono p-2 rounded border bg-background"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <JSONPreview value={value} />
      )}
    </div>
  );
}

function JSONPreview({ value }: { value: any }) {
  const jsonString = (() => {
    try {
      return JSON.stringify(value ?? {}, null, 2);
    } catch {
      return '';
    }
  })();

  return (
    <pre className="text-[11px] leading-4 overflow-auto max-h-56 font-mono whitespace-pre-wrap">
      {jsonString}
    </pre>
  );
}
