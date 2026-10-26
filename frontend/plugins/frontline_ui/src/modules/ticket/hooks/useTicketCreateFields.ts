import { useCallback, useMemo, useState } from 'react';
import { ISystemFieldRules, isFieldVisibleByLogic } from 'ui-modules';
import { TTicketLayoutCell } from '@/ticket/hooks/useTicketCreateLayout';
import { TAddTicket } from '@/ticket/types';

type TPropertiesData = Record<string, unknown>;

const isEmpty = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

/**
 * Property values of the create form, which cells show by their logic, and
 * which required ones are still empty. Hidden fields are never required and
 * never sent, so switching pipelines drops what the new form does not have.
 */
export const useTicketCreateFields = ({
  rows,
  rules,
}: {
  rows: TTicketLayoutCell[][];
  rules: ISystemFieldRules;
}) => {
  const [propertiesData, setPropertiesData] = useState<TPropertiesData>({});
  const [missingIds, setMissingIds] = useState<string[]>([]);

  const visibleRows = useMemo(
    () =>
      rows
        .map((row) =>
          row.filter(
            (cell) =>
              cell.kind === 'system' ||
              isFieldVisibleByLogic(cell.field, propertiesData),
          ),
        )
        .filter((row) => row.length),
    [rows, propertiesData],
  );

  const setPropertyValue = useCallback((fieldId: string, value: unknown) => {
    setPropertiesData((prev) => ({ ...prev, [fieldId]: value }));
    setMissingIds((prev) =>
      prev.filter((id) => id !== `property:${fieldId}`),
    );
  }, []);

  // Names of required fields left empty; marks them for the form to show.
  const findMissing = ({
    values,
    descriptionEmpty,
    descriptionLabel,
    labelOf,
  }: {
    values: TAddTicket;
    descriptionEmpty: boolean;
    descriptionLabel: string;
    labelOf: (cell: TTicketLayoutCell) => string;
  }) => {
    const cells = visibleRows.flat();
    const missingCells = cells.filter((cell) =>
      cell.kind === 'system'
        ? rules.isRequired(cell.code) && isEmpty(values[cell.code])
        : cell.field.isRequired && isEmpty(propertiesData[cell.field._id]),
    );
    const names = missingCells.map(labelOf);

    if (rules.isRequired('description') && descriptionEmpty) {
      names.push(descriptionLabel);
    }

    setMissingIds(missingCells.map((cell) => cell.id));

    return names;
  };

  // Only what the form shows now goes out.
  const shownPropertiesData = () => {
    const entries = visibleRows
      .flat()
      .flatMap((cell) =>
        cell.kind === 'property' && !isEmpty(propertiesData[cell.field._id])
          ? [[cell.field._id, propertiesData[cell.field._id]] as const]
          : [],
      );

    return entries.length ? Object.fromEntries(entries) : undefined;
  };

  const reset = () => {
    setPropertiesData({});
    setMissingIds([]);
  };

  return {
    visibleRows,
    propertiesData,
    missingIds,
    setPropertyValue,
    findMissing,
    shownPropertiesData,
    reset,
  };
};
