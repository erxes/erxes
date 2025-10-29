export interface IOrganizationCharge {
  [key: string]: {
    free: number;
    purchased: number;
    used: number;
  };
}
