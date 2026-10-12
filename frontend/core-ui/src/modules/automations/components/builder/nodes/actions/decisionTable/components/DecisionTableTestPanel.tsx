import { DecisionTableSectionHeader } from '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableSectionHeader';
import {
  TDecisionTableTestOutput,
  TDecisionTableTestResult,
  useDecisionTableTest,
} from '@/automations/components/builder/nodes/actions/decisionTable/hooks/useDecisionTableTest';
import { TDecisionTableInput } from '@/automations/components/builder/nodes/actions/decisionTable/utils/decisionTableCells';
import { Checkbox, Input, Label, Select } from 'erxes-ui';
import { MembersInline, useSegmentDetail } from 'ui-modules';

export const DecisionTableTestPanel = () => {
  const {
    inputs,
    values,
    setValue,
    segmentIds,
    memberOf,
    toggleSegment,
    result,
  } = useDecisionTableTest();

  return (
    <div className="flex flex-col gap-3">
      <DecisionTableSectionHeader
        title="Try it"
        description="Enter sample values to see which row answers"
      />
      <div className="flex flex-col gap-3 rounded-lg border bg-background p-3">
        {inputs
          .filter(({ type }) => type !== 'segment')
          .map((input) => (
            <DecisionTableTestValue
              key={input.key}
              input={input}
              value={values[input.key] ?? ''}
              onChange={(value) => setValue(input.key, value)}
            />
          ))}
        {segmentIds.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label>The record is in</Label>
            {segmentIds.map((segmentId) => (
              <DecisionTableTestSegment
                key={segmentId}
                segmentId={segmentId}
                checked={memberOf.includes(segmentId)}
                onToggle={() => toggleSegment(segmentId)}
              />
            ))}
          </div>
        )}
        <DecisionTableTestOutcome result={result} />
      </div>
    </div>
  );
};

const DecisionTableTestValue = ({
  input,
  value,
  onChange,
}: {
  input: TDecisionTableInput;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="flex items-center gap-3">
    <Label className="w-32 shrink-0 truncate">{input.key || 'Input'}</Label>
    {input.type === 'option' && input.options.length ? (
      <Select value={value} onValueChange={onChange}>
        <Select.Trigger>
          <Select.Value placeholder="Pick an option" />
        </Select.Trigger>
        <Select.Content>
          {input.options.map((option) => (
            <Select.Item key={option} value={option}>
              {option}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    ) : (
      <Input
        type={input.type === 'number' ? 'number' : 'text'}
        value={value}
        placeholder="Leave empty to test a missing value"
        onChange={(event) => onChange(event.target.value)}
      />
    )}
  </div>
);

const DecisionTableTestSegment = ({
  segmentId,
  checked,
  onToggle,
}: {
  segmentId: string;
  checked: boolean;
  onToggle: () => void;
}) => {
  const { segment, unavailable } = useSegmentDetail(segmentId);

  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={onToggle} />
      {unavailable ? 'Deleted segment' : segment?.name || '...'}
    </label>
  );
};

const DecisionTableTestOutcome = ({
  result,
}: {
  result: TDecisionTableTestResult;
}) => {
  if (result.status === 'fail') {
    return (
      <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
        No row matches, so the run stops with an error
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1 rounded-md bg-muted px-3 py-2 text-sm">
      <span className="font-medium">
        {result.status === 'matched'
          ? `Row ${result.row} matches`
          : 'No row matches; default values are used'}
      </span>
      {result.outputs.map((output) => (
        <DecisionTableTestOutputValue key={output.key} output={output} />
      ))}
    </div>
  );
};

const DecisionTableTestOutputValue = ({
  output,
}: {
  output: TDecisionTableTestOutput;
}) => (
  <div className="flex items-center gap-2 text-muted-foreground">
    <span>{output.key}:</span>
    {output.type === 'user' && output.value ? (
      <MembersInline memberIds={[output.value]} size="sm" />
    ) : (
      <span>{output.value || '(empty)'}</span>
    )}
  </div>
);
