import {
  decisionTableFormSchema,
  fromDecisionTableConfig,
  TDecisionTableForm,
  toDecisionTableConfig,
} from '@/automations/components/builder/nodes/actions/decisionTable/states/decisionTableForm';
import {
  DECISION_TABLE_ANY,
  TDecisionTableConfig,
} from '@/automations/components/builder/nodes/actions/decisionTable/utils/decisionTableCells';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  generateAutomationElementId,
  TAutomationAction,
  useFormValidationErrorHandler,
} from 'ui-modules';

const EMPTY_FORM: TDecisionTableForm = {
  inputs: [
    {
      key: '',
      type: 'text',
      value: '',
      optionsText: '',
      rangeMin: '',
      rangeMax: '',
    },
  ],
  outputs: [{ key: '', type: 'text' }],
  rows: [],
  noMatchMode: 'default',
  noMatchThen: [''],
};

const getDefaultValues = (
  currentAction: TAutomationAction<TDecisionTableConfig>,
) =>
  currentAction?.config?.inputs?.length
    ? fromDecisionTableConfig(currentAction.config)
    : EMPTY_FORM;

export const useDecisionTableConfigForm = ({
  currentAction,
  handleSave,
}: {
  currentAction: TAutomationAction<TDecisionTableConfig>;
  handleSave: (config: TDecisionTableConfig) => void;
}) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Decision table',
  });
  const form = useForm<TDecisionTableForm>({
    resolver: zodResolver(decisionTableFormSchema),
    defaultValues: getDefaultValues(currentAction),
  });
  const { control, getValues, setValue } = form;

  const inputs = useFieldArray({ control, name: 'inputs' });
  const outputs = useFieldArray({ control, name: 'outputs' });
  const rows = useFieldArray({ control, name: 'rows' });

  // Every row carries one cell per column, so columns and cells move together
  const updateRowCells = (
    field: 'when' | 'then',
    update: (cells: string[]) => string[],
  ) => {
    getValues('rows').forEach((row, index) => {
      setValue(`rows.${index}.${field}`, update([...row[field]]));
    });
  };

  const addInput = () => {
    inputs.append(EMPTY_FORM.inputs[0]);
    updateRowCells('when', (cells) => [...cells, DECISION_TABLE_ANY]);
  };

  const removeInput = (index: number) => {
    inputs.remove(index);
    updateRowCells('when', (cells) => cells.filter((_, i) => i !== index));
  };

  const addOutput = () => {
    outputs.append({ key: '', type: 'text' });
    updateRowCells('then', (cells) => [...cells, '']);
    setValue('noMatchThen', [...getValues('noMatchThen'), '']);
  };

  const removeOutput = (index: number) => {
    outputs.remove(index);
    updateRowCells('then', (cells) => cells.filter((_, i) => i !== index));
    setValue(
      'noMatchThen',
      getValues('noMatchThen').filter((_, i) => i !== index),
    );
  };

  const addRow = () => {
    rows.append({
      id: generateAutomationElementId(getValues('rows').map(({ id }) => id)),
      when: getValues('inputs').map(() => DECISION_TABLE_ANY),
      then: getValues('outputs').map(() => ''),
    });
  };

  const onSubmit = form.handleSubmit(
    (values) => handleSave(toDecisionTableConfig(values)),
    handleValidationErrors,
  );

  return {
    form,
    inputFields: inputs.fields,
    outputFields: outputs.fields,
    rowFields: rows.fields,
    addInput,
    removeInput,
    addOutput,
    removeOutput,
    addRow,
    removeRow: rows.remove,
    moveRow: rows.move,
    onSubmit,
  };
};

export type TDecisionTableConfigFormApi = ReturnType<
  typeof useDecisionTableConfigForm
>;
