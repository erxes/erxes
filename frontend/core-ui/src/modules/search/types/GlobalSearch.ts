export interface IGlobalSearchCustomer {
  _id: string;
  firstName?: string | null;
  lastName?: string | null;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
}

export interface IGlobalSearchCompany {
  _id: string;
  primaryName?: string | null;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
}

export interface IGlobalSearchConversation {
  _id: string;
  content?: string | null;
  customer?: {
    _id: string;
    firstName?: string | null;
    lastName?: string | null;
    primaryEmail?: string | null;
  } | null;
  integration?: {
    _id: string;
    kind?: string | null;
  } | null;
}

export interface IGlobalSearchTicket {
  _id: string;
  name?: string | null;
  number?: string | null;
}

export interface IGlobalSearchProduct {
  _id: string;
  name?: string | null;
  code?: string | null;
  unitPrice?: number | null;
}

export interface IGlobalSearchTeamMember {
  _id: string;
  email?: string | null;
  username?: string | null;
  details?: {
    fullName?: string | null;
  } | null;
}

export interface IGlobalSearchChannel {
  _id: string;
  name?: string | null;
  description?: string | null;
}

export interface IGlobalSearchForm {
  _id: string;
  name?: string | null;
  title?: string | null;
  code?: string | null;
}

export interface IGlobalSearchDeal {
  _id: string;
  name?: string | null;
  number?: string | null;
  boardId?: string | null;
  pipeline?: {
    _id: string;
    boardId?: string | null;
  } | null;
}
