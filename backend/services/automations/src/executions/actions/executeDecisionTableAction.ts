import {
  AUTOMATION_ERROR_CODES,
  buildFailedAction,
  decisionTableConfigSchema,
  findDecisionTableRow,
  IAutomationAction,
  IAutomationExecutionDocument,
  isEmptyDecisionValue,
  replaceOutputPlaceholders,
  TDecisionTableConfig,
  validateDecisionTableConfig,
} from 'erxes-api-shared/core-modules';
import { isInSegment } from '../../utils/isInSegment';
import { AutomationActionError } from '../errorCodes';

const parseConfig = (rawConfig: unknown): TDecisionTableConfig => {
  const parsed = decisionTableConfigSchema.safeParse(rawConfig);

  if (!parsed.success) {
    throw new AutomationActionError(
      `Decision table config is invalid: ${parsed.error.issues
        .map(({ path, message }) => `${path.join('.')} ${message}`)
        .join('; ')}`,
      AUTOMATION_ERROR_CODES.CONFIG_INVALID,
    );
  }

  const errors = validateDecisionTableConfig(parsed.data);

  if (errors.length) {
    throw new AutomationActionError(
      `Decision table config is invalid: ${errors.join('; ')}`,
      AUTOMATION_ERROR_CODES.CONFIG_INVALID,
    );
  }

  return parsed.data;
};

const coerceOutputs = (
  config: TDecisionTableConfig,
  values: Record<string, unknown>,
) =>
  config.outputs.reduce<Record<string, unknown>>((acc, { key, type }) => {
    const value = values[key];

    acc[key] =
      type === 'number' && !isEmptyDecisionValue(value) ? Number(value) : value;

    return acc;
  }, {});

export const executeDecisionTableAction = async ({
  subdomain,
  execution,
  action,
}: {
  subdomain: string;
  execution: IAutomationExecutionDocument;
  action: IAutomationAction;
}) => {
  const config = parseConfig(action.config);

  const valueExpressions = Object.fromEntries(
    config.inputs
      .filter(({ type }) => type !== 'segment')
      .map(({ key, value }) => [key, value]),
  );
  const values = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: valueExpressions,
    defaultValue: '',
    keepUnresolvedPlaceholders: false,
  });

  // Recorded so a no-match can be traced to the input that was missing
  const emptyInputs = Object.keys(valueExpressions).filter((key) =>
    isEmptyDecisionValue(values[key]),
  );

  const match = await findDecisionTableRow({
    config,
    values,
    isInSegment: (segmentId) =>
      isInSegment(subdomain, segmentId, execution.targetId, 0),
  });

  const evidence = {
    inputs: values,
    emptyInputs,
  };

  if (!match && config.noMatch.mode === 'fail') {
    return buildFailedAction(
      emptyInputs.length
        ? `No decision table row matched; empty inputs: ${emptyInputs.join(
            ', ',
          )}`
        : 'No decision table row matched',
      AUTOMATION_ERROR_CODES.BUSINESS_ERROR,
      { ...evidence, matched: false },
    );
  }

  const then = match
    ? match.row.then
    : config.noMatch.mode === 'default'
    ? config.noMatch.then
    : {};

  // Output cells may reference trigger or earlier action values too
  const resolvedThen = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: then,
    defaultValue: '',
    keepUnresolvedPlaceholders: false,
  });

  return {
    data: coerceOutputs(config, resolvedThen),
    matched: !!match,
    usedDefault: !match,
    matchedRow: match ? match.rowIndex + 1 : null,
    matchedRowId: match?.row.id ?? null,
    ...evidence,
  };
};
