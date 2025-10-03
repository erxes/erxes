export interface IFacebookCustomer {
  userId: string;
  erxesApiId?: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  integrationId: string;
}

export interface IFacebookCustomerDocument extends IFacebookCustomer, Document {
  _id: string;
}
