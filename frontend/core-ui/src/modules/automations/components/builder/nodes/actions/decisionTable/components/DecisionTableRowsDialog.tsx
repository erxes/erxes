import {
  DecisionTableThenCell,
  DecisionTableWhenCell,
} from '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableCells';
import { DecisionTableAnalysisNotice } from '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableAnalysisNotice';
import { useDecisionTableFormContext } from '@/automations/components/builder/nodes/actions/decisionTable/context/DecisionTableFormContext';
import {
  IconArrowDown,
  IconArrowUp,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { Button, Dialog, Table } from 'erxes-ui';
import { useWatch } from 'react-hook-form';

export const DecisionTableRowsDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { form, rowFields, addRow } = useDecisionTableFormContext();
  const inputs = useWatch({ control: form.control, name: 'inputs' });
  const outputs = useWatch({ control: form.control, name: 'outputs' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.ContentCombined
        className="max-w-[min(1100px,calc(100vw-4rem))]"
        title="Decision table rows"
        description="Rows are tried top to bottom; the first row whose every cell matches wins"
      >
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-auto p-4">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head className="w-10">#</Table.Head>
                {inputs.map((input, index) => (
                  <Table.Head key={`in-${index}`}>
                    {input.key || `Input ${index + 1}`}
                  </Table.Head>
                ))}
                {outputs.map((output, index) => (
                  <Table.Head
                    key={`out-${index}`}
                    className={index === 0 ? 'border-l' : undefined}
                  >
                    → {output.key || `Output ${index + 1}`}
                  </Table.Head>
                ))}
                <Table.Head className="w-28" />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rowFields.map((field, rowIndex) => (
                <DecisionTableRowItem
                  key={field.id}
                  rowIndex={rowIndex}
                  inputCount={inputs.length}
                  outputCount={outputs.length}
                />
              ))}
            </Table.Body>
          </Table>
          {!rowFields.length && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Add the first rule. Every row that is left out falls to the no
              match setting.
            </p>
          )}
          <div>
            <Button type="button" variant="outline" onClick={addRow}>
              <IconPlus />
              Add row
            </Button>
          </div>
          <DecisionTableAnalysisNotice />
        </div>
        <Dialog.Footer>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </Dialog.Footer>
      </Dialog.ContentCombined>
    </Dialog>
  );
};

const DecisionTableRowItem = ({
  rowIndex,
  inputCount,
  outputCount,
}: {
  rowIndex: number;
  inputCount: number;
  outputCount: number;
}) => {
  const { rowFields, removeRow, moveRow } = useDecisionTableFormContext();

  return (
    <Table.Row>
      <Table.Cell className="align-top text-muted-foreground">
        {rowIndex + 1}
      </Table.Cell>
      {Array.from({ length: inputCount }, (_, inputIndex) => (
        <Table.Cell key={`in-${inputIndex}`} className="align-top">
          <DecisionTableWhenCell rowIndex={rowIndex} inputIndex={inputIndex} />
        </Table.Cell>
      ))}
      {Array.from({ length: outputCount }, (_, outputIndex) => (
        <Table.Cell
          key={`out-${outputIndex}`}
          className={outputIndex === 0 ? 'border-l align-top' : 'align-top'}
        >
          <DecisionTableThenCell
            name={`rows.${rowIndex}.then.${outputIndex}`}
            outputIndex={outputIndex}
          />
        </Table.Cell>
      ))}
      <Table.Cell className="align-top">
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={rowIndex === 0}
            onClick={() => moveRow(rowIndex, rowIndex - 1)}
          >
            <IconArrowUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={rowIndex === rowFields.length - 1}
            onClick={() => moveRow(rowIndex, rowIndex + 1)}
          >
            <IconArrowDown className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => removeRow(rowIndex)}
          >
            <IconTrash className="size-4" />
          </Button>
        </div>
      </Table.Cell>
    </Table.Row>
  );
};
