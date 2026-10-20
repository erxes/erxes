import type { IEmailFieldProps } from 'erxes-ui/modules/inputs';
export type EmailDisplayProps = IEmailFieldProps & {
  onEmailClick?: (email: string) => void;
  onEmailDoubleClick?: (email: string) => void;
  onEmailKeyActivate?: (email: string) => void;
};
