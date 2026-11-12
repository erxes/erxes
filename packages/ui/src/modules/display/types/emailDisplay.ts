import type { IEmailFieldProps } from 'erxes-ui/modules/inputs/types/emailField';

export type EmailDisplayProps = IEmailFieldProps & {
  maxVisible?: number;
  onEmailClick?: (email: string) => void;
  onEmailDoubleClick?: (email: string) => void;
  onEmailKeyActivate?: (email: string) => void;
};
