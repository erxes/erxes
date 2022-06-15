export interface IAttachment {
  name: string;
  type: string;
  url: string;
  size?: number;
}

export type IFormProps = {
  errors: any;
  values: any;
  registerChild: (child: React.ReactNode) => void;
  runValidations?: (callback: any) => void;
  resetSubmit?: () => void;
  isSubmitted: boolean;
};

export type IButtonMutateProps = {
  name?: string;
  values: any;
  isSubmitted: boolean;
  confirmationUpdate?: boolean;
  callback?: () => void;
  resetSubmit?: () => void;
  size?: string;
  object?: any;
  text?: string;
  icon?: string;
  type?: string;
  disableLoading?: boolean;
};
