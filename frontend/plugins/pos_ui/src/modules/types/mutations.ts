export interface CatProdInput {
    categoryId: string;
    productId: string;
  }
  
  export interface GroupInput {
    _id?: string;
    name: string;
    description?: string;
    products?: string[];
  }
  
  export interface SlotInput {
    _id?: string;
    name: string;
    description?: string;
  }
  
  export interface PosCommonFieldsInput {
    name?: string;
    description?: string;
    orderPassword?: string;
    scopeBrandIds?: string[];
    pdomain?: string;
    erxesAppToken?: string;
    productDetails?: string[];
    adminIds?: string[];
    cashierIds?: string[];
    paymentIds?: string[];
    paymentTypes?: any[]; 
    isOnline?: boolean;
    onServer?: boolean;
    branchId?: string;
    departmentId?: string;
    allowBranchIds?: string[];
    beginNumber?: string;
    maxSkipNumber?: number;
    kitchenScreen?: any; 
    waitingScreen?: any; 
    kioskMachine?: any; 
    uiOptions?: any; 
    ebarimtConfig?: any; 
    erkhetConfig?: any; 
    cardsConfig?: any; 
    catProdMappings?: CatProdInput[];
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
  }

export interface PosListQueryResponse {
    posList: {
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
    }[];
  }
  
export  interface RemoveMutationResponse {
    posRemove: string;
  }
  
export  interface QueryParams {
    page?: string | number;
    perPage?: string | number;
    status?: string;
    sortField?: string;
    sortDirection?: string | number;
    [key: string]: any;
  }
  
export  interface RouterInterface {
    generatePaginationParams: (params: QueryParams) => {
      page?: number;
      perPage?: number;
      [key: string]: any;
    };
  }
  
export interface ConfirmFunction {
    (message: string): Promise<boolean>;
  }
  
export interface AlertInterface {
    success: (message: string) => void;
    error: (message: string) => void;
  }

  export interface PosData {
    _id: string;
    name: string;
    description: string;
    orderPassword?: string;
    scopeBrandIds?: string[];
    pdomain?: string;
    createdAt?: string;
    token?: string;
    erxesAppToken?: string;
    adminIds?: string[];
    cashierIds?: string[];
    paymentIds?: string[];
    paymentTypes?: any[];
    user?: {
      _id: string;
      details: {
        avatar?: string;
        fullName?: string;
      };
    };
    isOnline?: boolean;
    onServer?: boolean;
    branchId?: string;
    departmentId?: string;
    allowBranchIds?: string[];
    beginNumber?: string;
    maxSkipNumber?: number;
    waitingScreen?: any;
    kitchenScreen?: any;
    kioskMachine?: any;
    uiOptions?: any;
    ebarimtConfig?: any;
    erkhetConfig?: any;
    cardsConfig?: any;
    catProdMappings?: Array<{
      _id: string;
      categoryId: string;
      code: string;
      name: string;
      productId: string;
    }>;
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
    productDetails?: string[];
  }
  
  export interface AddPosDetailResult {
    posAdd: PosData;
  }
  
  export interface AddPosDetailVariables {
    name: string;
    description: string;
    orderPassword?: string;
    scopeBrandIds?: string[];
    pdomain?: string;
    erxesAppToken?: string;
    productDetails?: string[];
    adminIds?: string[];
    cashierIds?: string[];
    paymentIds?: string[];
    paymentTypes?: any[];
    isOnline?: boolean;
    onServer?: boolean;
    branchId?: string;
    departmentId?: string;
    allowBranchIds?: string[];
    beginNumber?: string;
    maxSkipNumber?: number;
    kitchenScreen?: any;
    waitingScreen?: any;
    kioskMachine?: any;
    uiOptions?: any;
    ebarimtConfig?: any;
    erkhetConfig?: any;
    cardsConfig?: any;
    catProdMappings?: any[];
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
  }
  
  export interface UpdatePosDetailResult {
    posEdit: PosData;
  }
  
  export interface UpdatePosDetailVariables extends AddPosDetailVariables {
    _id: string;
  }
  
  export interface PosListData {
    posList: PosData[];
  }
  