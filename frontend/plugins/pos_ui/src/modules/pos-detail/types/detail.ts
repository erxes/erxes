export interface PosDetailQueryResponse {
    posDetail: {
      _id: string;
      name: string;
      description?: string;
      orderPassword?: string;
      scopeBrandIds?: string[];
      pdomain?: string;
      createdAt: string;
      token?: string;
      erxesAppToken?: string;
      adminIds?: string[];
      cashierIds?: string[];
      paymentIds?: string[];
      paymentTypes?: string[];
      user?: {
        _id: string;
        details?: {
          avatar?: string;
          fullName?: string;
        };
      };
      isOnline?: boolean;
      onServer?: boolean;
      branchId?: string;
      departmentId?: string;
      allowBranchIds?: string[];
      beginNumber?: number;
      maxSkipNumber?: number;
      waitingScreen?: any;
      kitchenScreen?: any;
      kioskMachine?: any;
      uiOptions?: any;
      ebarimtConfig?: any;
      erkhetConfig?: any;
      cardsConfig?: any;
      catProdMappings?: {
        _id: string;
        categoryId: string;
        code: string;
        name: string;
        productId: string;
      }[];
      initialCategoryIds?: string[];
      kioskExcludeCategoryIds?: string[];
      kioskExcludeProductIds?: string[];
      deliveryConfig?: any;
      checkRemainder?: boolean;
      permissionConfig?: any;
      allowTypes?: string[];
      isCheckRemainder?: boolean;
      checkExcludeCategoryIds?: string[];
      banFractions?: boolean;
      branchTitle?: string;
      departmentTitle?: string;
      productDetails?: any;
      adminTeamMember?: string;
      adminPrintTempBill?: boolean;
      adminDirectSales?: boolean;
      adminDirectDiscountLimit?: string;
      cashierTeamMember?: string;
      cashierPrintTempBill?: boolean;
      cashierDirectSales?: boolean;
      cashierDirectDiscountLimit?: string;
    };
  }
  
export interface GroupsQueryResponse {
    productGroups: {
      _id: string;
      posId: string;
      name: string;
      description?: string;
      categoryIds?: string[];
      excludedCategoryIds?: string[];
      excludedProductIds?: string[];
    }[];
  }