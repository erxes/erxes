export interface IConformityDoc {
  mainType?: string;
  mainTypeId?: string;
  relType?: string;
  relTypeId?: string;
}

export interface IConformityCreate {
  mainType?: string;
  mainTypeId?: string;
  relType?: string;
  relTypeIds?: string[];
}

export type CreateConformityVariables = {
  _id: string;
  relType: string;
  relTypeIds: string[];
};

// mutation types
export type AddConformityMutation = ({ variables: IConformityDoc }) => void;

export type CreateConformityMutation = (
  { variables: CreateConformityVariables }
) => Promise<any>;
