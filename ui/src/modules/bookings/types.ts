import { IUser } from 'modules/auth/types';
import { QueryResponse } from 'modules/common/types';
import { ILeadData } from 'modules/leads/types';
import { IBrand } from 'modules/settings/brands/types';
import { IIntegration } from 'modules/settings/integrations/types';
import { IProductCategory } from 'modules/settings/productService/types';
import { ITag } from 'modules/tags/types';

export interface IStyle {
  itemShape?: string;
  widgetColor: string;
  productAvailable: string;
  productUnavailable: string;
  productSelected: string;

  textAvailable: string;
  textUnavailable: string;
  textSelected: string;
}

export interface IDisplayBlock {
  shape?: string;
  columns?: number;
  rows?: number;
  margin?: number;
}

export interface IBookingIntegration extends IIntegration {
  brand: IBrand;
  tags: ITag[];
  createdUser: IUser;
}

// query types
export type BookingIntegrationsQueryResponse = {
  integrations: IBookingIntegration[];
} & QueryResponse;

export type BookingIntegrationDetailQueryResponse = {
  integrationDetail: IBookingIntegration;
} & QueryResponse;

export interface IBookingData {
  // content
  name?: string;
  image?: any;
  description?: string;
  userFilters?: string[];
  productCategoryId?: string;
  style?: IStyle;
  displayBlock?: IDisplayBlock;
  mainProductCategory?: IProductCategory;

  viewCount?: number;
}

export type RemoveMutationVariables = {
  _id: string;
};

export type RemoveMutationResponse = {
  removeMutation: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

export type IntegrationMutationVariables = {
  brandId: string;
  name: string;
  channelIds?: string[];
  data?: any;
};

export type AddBookingIntegrationMutationVariables = {
  leadData: ILeadData;
  bookingData: IBookingData;
  languageCode: string;
  formId: string;
} & IntegrationMutationVariables;

export type AddBookingIntegrationMutationResponse = {
  addIntegrationMutation: (params: {
    variables: AddBookingIntegrationMutationVariables;
  }) => Promise<any>;
};

export type EditBookingIntegrationMutationVariables = {
  _id: string;
  leadData: ILeadData;
  bookingData: IBookingData;
  languageCode: string;
  formId: string;
} & IntegrationMutationVariables;

export type EditBookingIntegrationMutationResponse = {
  editIntegrationMutation: (params: {
    variables: EditBookingIntegrationMutationVariables;
  }) => Promise<void>;
};
