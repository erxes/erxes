import { useDecisionTableListCell } from '@/automations/components/builder/nodes/actions/decisionTable/hooks/useDecisionTableListCell';
import { Badge, Button, Combobox, Command, Popover } from 'erxes-ui';
import { SelectSegment, useSegmentDetail } from 'ui-modules';

type TListCellProps = {
  value: string;
  onChange: (value: string) => void;
};

export const DecisionTableOptionCell = ({
  value,
  onChange,
  options,
}: TListCellProps & { options: string[] }) => {
  const { isAny, selected, toggle, setAny } = useDecisionTableListCell({
    value,
    onChange,
  });

  return (
    <Popover>
      <Combobox.Trigger className="w-full min-w-28">
        <span className="truncate">{isAny ? 'Any' : selected.join(', ')}</span>
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.List>
            <Command.Item onSelect={setAny}>
              Any value
              <Combobox.Check checked={isAny} />
            </Command.Item>
            {options.map((option) => (
              <Command.Item key={option} onSelect={() => toggle(option)}>
                {option}
                <Combobox.Check checked={selected.includes(option)} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const DecisionTableSegmentName = ({ segmentId }: { segmentId: string }) => {
  const { segment, unavailable } = useSegmentDetail(segmentId);

  if (unavailable) {
    return <Badge variant="destructive">Deleted segment</Badge>;
  }

  return <Badge variant="secondary">{segment?.name || '...'}</Badge>;
};

export const DecisionTableSegmentCell = ({
  value,
  onChange,
}: TListCellProps) => {
  const { isAny, selected, setFromPicker, setAny } = useDecisionTableListCell({
    value,
    onChange,
  });

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-auto min-h-8 w-full min-w-36 flex-wrap justify-start gap-1 py-1"
        >
          {isAny
            ? 'Any segment'
            : selected.map((segmentId) => (
                <DecisionTableSegmentName
                  key={segmentId}
                  segmentId={segmentId}
                />
              ))}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="start" className="w-[380px] p-2">
        <Button
          type="button"
          variant={isAny ? 'secondary' : 'ghost'}
          className="mb-2 w-full justify-start"
          onClick={setAny}
        >
          Any segment
        </Button>
        <SelectSegment
          mode="multiple"
          selected={selected}
          onSelect={setFromPicker}
        />
      </Popover.Content>
    </Popover>
  );
};
