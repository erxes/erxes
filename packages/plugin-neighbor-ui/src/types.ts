type location = {
  type: String;
  coordinates: Number[];
};
type ageGroups = {
  genz: Number;
  millennials: Number;
  genx: Number;
  boomers: Number;
};
type sex = {
  male: Number;
  female: Number;
};

type Attachment = {
  name: String;
  type: String;
  url: String;
  size: String;
  duration: String;
};
export type School = {
  description: String;
  district: String;
  khoroo: String;
  locationValue: location;
};
export type University = {
  description: String;
  locationValue: location;
};
export type Soh = {
  thermality: String;
  electricity: String;
  security: String;
  cable: String;
};
export type Khoroo = {
  distance: String;
  khorooNumber: String;
  address: String;
  phoneNumber: String;
  hospital: String;
  locationValue: location;
  aptHouseholder: Number;
  ageGroup: ageGroups;
  sex: sex;
};
export type EnvInfo = {
  camera: Number;
  walkingEnv: Number;
  basketball: Number;
  playground: Number;
  greenPlant: Number;
  streetLighting: Number;
};
export type Common = {
  district: String;
  khoroo: String;
  locationValue: location;
};
export type DistrictTown = {
  averagePrice: String;
  averageM2: Number;
  population: Number;
  averageAge: Number;
  publicService: String;
  featuredAds: String;
  market: String;
  districtProfile: String;
  publicServiceAttachment: Attachment;
  featuredAdsAttachment: Attachment;
  marketAttachment: Attachment;
  districtProfileAttachment: Attachment;
};

export type NeighborItemRemoveVariables = {
  _id: string;
};

export type NeighborItemRemoveMutationResponse = {
  neighborItemRemove: (params: {
    variables: NeighborItemRemoveVariables;
  }) => Promise<any>;
};

export type NeighborItemsQueryResponse = {
  getNeighborItems: Promise<any>;
  loading: Boolean;
  error: any;
  refetch: () => void;
};
export interface ILocationOption {
  lat: number;
  lng: number;
  description?: string;
}
