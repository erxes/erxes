import { createContext, use } from 'react';

/** What a form row tells the control inside it: its label, its error or hint, and its state. */
export interface FieldControlProps {
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

/**
 * Set by a form row (`PanelFormRow`) for the input, text box, select or picker in it.
 * A popover's content starts again from none, so a search box in a picker isn't the field.
 */
export const FieldControlContext = createContext<FieldControlProps | null>(null);

/** A form row's label, error and state for its control. Spread them before the control's own props. */
export const useFieldControl = (): FieldControlProps => use(FieldControlContext) ?? {};

/** The row's error and state without its label, for a trigger the cell label already names. */
export const useFieldState = (): Omit<FieldControlProps, 'aria-labelledby'> => {
  const field = useFieldControl();

  return {
    'aria-describedby': field['aria-describedby'],
    'aria-invalid': field['aria-invalid'],
    'aria-required': field['aria-required'],
  };
};
