export type TConnectionFieldInputType =
  | 'text'
  | 'url'
  | 'email'
  | 'number'
  | 'textarea';

export interface IConnectionTypeField {
  key: string;
  label: string;
  description?: string | null;
  placeholder?: string | null;
  required?: boolean | null;
  secret?: boolean | null;
  inputType?: TConnectionFieldInputType | null;
  pattern?: string | null;
  minLength?: number | null;
  maxLength?: number | null;
}

export interface IConnectionType {
  id: string;
  pluginName: string;
  label: string;
  description?: string | null;
  icon: string;
  fields: IConnectionTypeField[];
  allowCustomFields: boolean;
  hasTest: boolean;
}

export type TConnectionStatus = 'verified' | 'failed' | 'incomplete' | 'ready';

export interface IConnectionField {
  key: string;
  label?: string | null;
  secret: boolean;
  // Plain fields only: the server never returns a secret value.
  value?: string | null;
  hasValue: boolean;
}

export interface IConnection {
  _id: string;
  name: string;
  icon?: string | null;
  logo?: string | null;
  type: string;
  typeLabel: string;
  typeAvailable: boolean;
  hasTest: boolean;
  status: TConnectionStatus;
  fields: IConnectionField[];
  lastTestedAt?: string | null;
  lastTestStatus?: 'success' | 'failed' | null;
  lastTestMessage?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface IConnectionFieldInput {
  key: string;
  label?: string;
  secret?: boolean;
  // Omitted for a saved secret the user did not replace.
  value?: string;
}

export interface IConnectionTestResult {
  ok: boolean;
  message?: string | null;
  connection?: IConnection | null;
}
