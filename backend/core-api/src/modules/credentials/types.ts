export type CredentialFieldType = 'text' | 'password' | 'number' | 'url' | 'boolean';

export interface CredentialField {
  key: string;
  label: string;
  type: CredentialFieldType;
  secret: boolean;
  required: boolean;
  help?: string;
}

export interface CredentialTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: CredentialField[];
}

export interface CredentialFieldInput {
  key: string;
  label?: string | null;
  type?: string | null;
  secret?: boolean | null;
  action: string;
  value?: string | null;
}

export interface CredentialInput {
  name: string;
  description?: string | null;
  templateId: string;
  category: string;
  fields: CredentialFieldInput[];
}

export interface CredentialEnvelope {
  version: number;
  keyId: string;
  nonce: string;
  ciphertext: string;
  tag: string;
}

export interface CredentialMetadata {
  _id: string;
  reference: string;
  name: string;
  description: string;
  templateId: string;
  category: string;
  fields: (CredentialField & { hasValue: boolean })[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredCredential extends CredentialMetadata {
  tenant: string;
  encryptedValues: CredentialEnvelope;
  revision: number;
}

export interface CredentialGrantMetadata {
  _id: string;
  credentialId: string;
  pluginName: string;
  name: string;
  createdAt: Date;
  revokedAt?: Date | null;
}

export interface StoredCredentialGrant extends CredentialGrantMetadata {
  tenant: string;
  tokenHash: string;
}

export type CredentialValues = Record<string, string>;

export class CredentialsError extends Error {
  readonly code: string;

  constructor(code = 'CREDENTIALS_UNAVAILABLE') {
    const messages: Record<string, string> = {
      CREDENTIALS_UNAVAILABLE: 'Credentials operation unavailable',
      CREDENTIALS_INVALID_INPUT: 'Invalid credential input',
      CREDENTIALS_FORBIDDEN: 'Credential access denied',
      CREDENTIALS_NOT_FOUND: 'Credential not found',
      CREDENTIALS_CONFLICT: 'Credential changed; reload before editing',
    };
    super(messages[code] || messages.CREDENTIALS_UNAVAILABLE);
    this.name = 'CredentialsError';
    this.code = code;
  }
}
