import { createContext, use } from 'react';

/** What a form row tells the control inside it: its label, its error or hint, and its state. */
export interface FieldControlProps {
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

interface FieldControl {
  /** For an input, text box or combobox, as it is. */
  control: FieldControlProps;
  /** The row's hidden "Required" note, for a control that can't carry `aria-required`. */
  requiredNoteId?: string;
}

/**
 * Set by a form row (`PanelFormRow`) for the input, text box, select or picker in it.
 * A popover's content starts again from none, so a search box in a picker isn't the field.
 */
export const FieldControlContext = createContext<FieldControl | null>(null);

/** A form row's label, error and state for its control. Spread them before the control's own props. */
export const useFieldControl = (): FieldControlProps => use(FieldControlContext)?.control ?? {};

/**
 * The row's error and state without its label, for a combobox trigger the cell label already
 * names.
 */
export const useFieldState = (): Omit<FieldControlProps, 'aria-labelledby'> => {
  const field = useFieldControl();

  return {
    'aria-describedby': field['aria-describedby'],
    'aria-invalid': field['aria-invalid'],
    'aria-required': field['aria-required'],
  };
};

/**
 * The row's error and state for a trigger that is a button, which the cell label already names.
 * A button can't carry `aria-required`, so a required row's "Required" note is read in its
 * description instead.
 */
export const useFieldButtonState = (): Pick<
  FieldControlProps,
  'aria-describedby' | 'aria-invalid'
> => {
  const field = use(FieldControlContext);

  const describedBy = [field?.requiredNoteId, field?.control['aria-describedby']]
    .filter(Boolean)
    .join(' ');

  return {
    'aria-describedby': describedBy || undefined,
    'aria-invalid': field?.control['aria-invalid'],
  };
};
