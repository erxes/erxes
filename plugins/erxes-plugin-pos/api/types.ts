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
