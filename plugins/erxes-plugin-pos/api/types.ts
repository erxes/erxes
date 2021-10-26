export interface IPOSIntegration {
  kind: string;
  name?: string;
  description?: string;
  brandId?: string;
  tagIds?: string[];
  isActive?: boolean;
  productDetails: string[];
  productGroupIds: string[];
}

export interface IPOS {
  name: string;
  description?: string;
  brandId: string;
  tagIds?: string[];
  productDetails: string[];
  adminIds: string[];
  cashierIds: string[];
  kitchenScreen: any;
  waitinScreen: any;
  kioskMachine: any;
  formSectionTitle: string;
  formIntegrationIds: string[];
}
