import { IActivityLogForMonth } from '../activityLogs/types';
import { IUser } from '../auth/types';
import { ICompany } from '../companies/types';
import { ICustomer } from '../customers/types';
import { IProduct, IProductDoc } from '../settings/productService/types';

export interface ICommonState {
  [key: string]: {
    type: string;
    index: number;
  };
}

export interface IBoard {
  _id: string;
  name: string;
  pipelines?: IPipeline[];
}

export interface IPipeline {
  _id: string;
  name: string;
}

export interface IStage {
  _id: string;
  name?: string;
  type?: string;
  index?: number;
  itemId?: string;
  amount?: any;
  deals?: IDeal[];
  dealsTotalCount: number;
}

export interface IDeal {
  _id: string;
  name: string;
  order: number;
  stageId: string;
  closeDate: Date;
  amount: number;
  modifiedAt: Date;
  assignedUsers: IUser[];
  companies: ICompany[];
  customers: ICustomer[];
  pipeline: IPipeline;
  stage?: IStage;
  products: any;
}

export interface IDealTotalAmount {
  _id: string;
  dealCount: number;
  dealAmounts: [
    {
      _id: string;
      amount: number;
      currency: string;
    }
  ];
}

export interface IProductData {
  _id: string;
  productId?: string;
  product?: IProduct;
  uom?: string;
  currency?: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  tax: number;
  discountPercent: number;
  discount: number;
  amount: number;
}

export interface IDraggableLocation {
  droppableId: string;
  index: number;
}

type Position = {
  _id?: string;
  droppableId?: string;
  index: number;
};

export interface IDragResult {
  type: string;
  destination: Position;
  source: Position;
  draggableId?: string;
  itemId?: string;
}

export interface IDealParams {
  _id?: string;
  name: string;
  stageId: string;
  assignedUserIds?: string[];
  companyIds?: string[];
  customerIds?: string[];
  closeDate?: Date;
  description?: string;
  order?: number;
  productsData?: IProductData[];
}

export interface IDealMap {
  [key: string]: IDeal[];
}

export interface IStageMap {
  [key: string]: IStage;
}

export type DealsQueryResponse = {
  deals: IDeal[];
  loading: boolean;
  refetch: () => void;
  fetchMore: any;
};

export type DealsTotalAmountsQueryResponse = {
  dealsTotalAmounts: IDealTotalAmount;
  refetch: () => void;
};

export type DealDetailQueryResponse = {
  dealDetail: IDeal;
  loading: boolean;
};

export type BoardsQueryResponse = {
  dealBoards: IBoard[];
  loading: boolean;
};

export type PipelinesQueryResponse = {
  dealPipelines: IPipeline[];
  loading: boolean;
  refetch: ({ boardId }: { boardId?: string }) => Promise<any>;
};

export type StagesQueryResponse = {
  dealStages: IStage[];
  loading: boolean;
  refetch: ({ pipelineId }: { pipelineId?: string }) => Promise<any>;
};

export type SaveDealMutation = ({ variables: IDealParams }) => Promise<any>;

export type RemoveDealVariables = {
  _id: string;
};

export type RemoveDealMutation = (
  { variables: RemoveDealVariables }
) => Promise<any>;

export type BoardsGetLastQueryResponse = {
  dealBoardGetLast: IBoard;
  loading: boolean;
};

export type BoardDetailQueryResponse = {
  dealBoardDetail: IBoard;
};

export type PipelineDetailQueryResponse = {
  dealPipelineDetail: IPipeline;
  loading: boolean;
};

export type ActivityLogQueryResponse = {
  activityLogsDeal: IActivityLogForMonth[];
  loading: boolean;
};

export type ProductsQueryResponse = {
  loading: boolean;
  refetch: (variables?: { searchValue?: string; perPage?: number }) => void;
  products: IProduct[];
};

export type ProductAddMutationResponse = {
  productAdd: (params: { variables: IProductDoc }) => Promise<void>;
};
