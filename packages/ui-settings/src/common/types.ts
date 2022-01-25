export interface ICommonListProps {
  objects: any;
  history: any;
  remove: (id: string) => void;
  save: () => void;
  refetch: () => void;
  totalCount: number;
  loading: boolean;
}

export interface ICommonRowActionProps {
  size?: string;
  object: any;
  remove: (id: string) => void;
  save: () => void;
}

export interface ICommonFormProps {
  object?: any;
  closeModal: () => void;
}
