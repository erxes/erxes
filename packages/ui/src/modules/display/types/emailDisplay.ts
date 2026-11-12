import type { IEmailFieldProps } from 'erxes-ui/modules/inputs/components/EmailField';

export type EmailDisplayProps = IEmailFieldProps & {
  maxVisible?: number;
  onEmailClick?: (email: string) => void;
  onEmailDoubleClick?: (email: string) => void;
  onEmailKeyActivate?: (email: string) => void;
};
