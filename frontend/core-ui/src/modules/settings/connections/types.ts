// The encrypted vault API remains backward compatible; Connections owns the UX.
export type CredentialField = {
  key: string;
  label: string;
  type: 'text' | 'password' | 'number' | 'url' | 'boolean';
  secret: boolean;
  required: boolean;
  help?: string | null;
  hasValue?: boolean;
};

export type CredentialTemplate = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  fields: CredentialField[];
};

export type CredentialMetadata = {
  _id: string;
  reference: string;
  name: string;
  description?: string | null;
  templateId: string;
  category: string;
  fields: CredentialField[];
  createdAt: string;
  updatedAt: string;
};

export type CredentialGrant = {
  _id: string;
  credentialId: string;
  pluginName: string;
  name: string;
  createdAt: string;
  revokedAt?: string | null;
};

export type CredentialInput = {
  name: string;
  description: string;
  templateId: string;
  category: string;
  fields: {
    key: string;
    label: string;
    type: CredentialField['type'];
    secret: boolean;
    action: 'keep' | 'replace' | 'clear';
    value?: string;
  }[];
};
