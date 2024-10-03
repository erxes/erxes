export interface IPluginCreator {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  description?: string;
}

export interface Plugin {
  _id: string;
  language?: string;

  createdAt?: Date;
  modifiedAt?: Date;
  createdBy?: string;
  modifiedBy?: string;

  // tab1
  avatar?: string;
  images?: string;
  image?: string;
  video?: string;

  title?: string;
  creator?: IPluginCreator;
  department?: string;

  description?: string;
  shortDescription?: string;
  screenShots?: string;
  features?: string;

  // tab 2
  tango?: string;

  // tab3
  changeLog?: string;
  lastUpdatedInfo?: string;
  contributors?: string;
  support?: string;

  // add-on fields
  mainType: string;
  osName: string;
  displayLocations: string[];
  type: string;
  limit?: number;
  count: number;
  initialCount?: number;
  growthInitialCount?: number;
  resetMonthly?: boolean;
  unit?: string;
  comingSoon?: boolean;

  categories?: string[];
  dependencies?: string[];
  stripeProductId: string;
  testProductId: string;
  relatedPlugins?: string[];
  unLimited?: boolean;

  // erxes-ui
  icon?: string;
  price?: {
    monthly?: number | string | null;
    yearly?: number | string | null;
    oneTime?: number | string | null;
  };
  status?: string;
}

interface ManageInstallVariables {
  type: string;
  name: string;
}

interface ManageInstallResponse {
  successMessage: string;
}

export type ManageInstallFunction = (options: {
  variables: ManageInstallVariables;
}) => Promise<ManageInstallResponse>;