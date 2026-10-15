import { IconArrowsMaximize } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import {
  TAutomationConditional,
  TAutomationConditionalFieldRender,
} from '../../types/conditionalTypes';
import { describeConditionalRow } from '../../utils/conditionalUtils';
import { AutomationConditionalValueSlot } from './AutomationConditionalValueSlot';

type TPreviewProps = {
  form: UseFormReturn<FieldValues>;
  names: string[];
  render: TAutomationConditionalFieldRender;
};

const noop = () => undefined;

// The field's own input shows the value, so ids read as the names they stand for
const AutomationConditionalValuePreview = ({
  values,
  ...previewProps
}: TPreviewProps & { values: Record<string, unknown> }) => (
  <div className="pointer-events-none select-none">
    <AutomationConditionalValueSlot
      parentForm={previewProps.form}
      names={previewProps.names}
      values={values}
      onChange={noop}
      render={previewProps.render}
    />
  </div>
);

export const AutomationConditionalSummary = ({
  conditional,
  onEdit,
  ...previewProps
}: TPreviewProps & {
  conditional: TAutomationConditional;
  onEdit: () => void;
}) => (
  <div className="flex flex-col rounded-md border bg-background">
    {conditional.rows.map((row, index) => (
      <div key={row.id} className="flex flex-col gap-1.5 border-b p-2">
        <div className="flex items-baseline gap-2 text-xs">
          <span className="text-muted-foreground">{index + 1}</span>
          <span className="truncate font-mono">
            {describeConditionalRow(row)}
          </span>
        </div>
        <AutomationConditionalValuePreview
          values={row.values}
          {...previewProps}
        />
      </div>
    ))}
    <div className="flex flex-col gap-1.5 p-2">
      <span className="text-xs text-muted-foreground">Otherwise</span>
      <AutomationConditionalValuePreview
        values={conditional.otherwise}
        {...previewProps}
      />
    </div>
    <div className="border-t p-2">
      <Button type="button" variant="outline" size="sm" onClick={onEdit}>
        <IconArrowsMaximize />
        Edit conditions
      </Button>
    </div>
  </div>
);
