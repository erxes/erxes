export interface IPOS {
  name: string;
  description?: string;
  brandId: string;
  tagIds?: string[];
  productDetails: string[];
  adminIds: string[];
  cashierIds: string[];
  kitchenScreen: any;
  waitingScreen: any;
  kioskMachine: any;
  uiOptions: any;
  formSectionTitle: string;
  formIntegrationIds: string[];
  ebarimtConfig: any;
}
