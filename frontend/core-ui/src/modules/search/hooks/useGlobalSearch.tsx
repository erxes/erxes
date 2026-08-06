import { useQuery } from '@apollo/client';
import {
  GLOBAL_SEARCH_CHANNELS,
  GLOBAL_SEARCH_COMPANIES,
  GLOBAL_SEARCH_CONVERSATIONS,
  GLOBAL_SEARCH_CUSTOMERS,
  GLOBAL_SEARCH_DEALS,
  GLOBAL_SEARCH_FORMS,
  GLOBAL_SEARCH_PRODUCTS,
  GLOBAL_SEARCH_TEAM_MEMBERS,
  GLOBAL_SEARCH_TICKETS,
} from '@/search/graphql/queries/globalSearch';
import {
  IGlobalSearchChannel,
  IGlobalSearchCompany,
  IGlobalSearchConversation,
  IGlobalSearchCustomer,
  IGlobalSearchDeal,
  IGlobalSearchForm,
  IGlobalSearchProduct,
  IGlobalSearchTeamMember,
  IGlobalSearchTicket,
} from '@/search/types/GlobalSearch';
import { useAtomValue } from 'jotai';
import { pluginsConfigState } from 'ui-modules';

export const GLOBAL_SEARCH_MIN_LENGTH = 2;
export const GLOBAL_SEARCH_PER_GROUP = 5;

const FRONTLINE_PLUGIN = 'frontline';
const SALES_PLUGIN = 'sales';

interface ICursorList<T> {
  list: T[];
  totalCount: number;
}

export interface IGlobalSearchResult {
  loading: boolean;
  customers: IGlobalSearchCustomer[];
  customersTotalCount: number;
  companies: IGlobalSearchCompany[];
  companiesTotalCount: number;
  products: IGlobalSearchProduct[];
  productsTotalCount: number;
  teamMembers: IGlobalSearchTeamMember[];
  teamMembersTotalCount: number;
  conversations: IGlobalSearchConversation[];
  conversationsTotalCount: number;
  tickets: IGlobalSearchTicket[];
  ticketsTotalCount: number;
  channels: IGlobalSearchChannel[];
  channelsTotalCount: number;
  forms: IGlobalSearchForm[];
  formsTotalCount: number;
  deals: IGlobalSearchDeal[];
  dealsTotalCount: number;
}

export const useGlobalSearch = (searchValue: string): IGlobalSearchResult => {
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const hasFrontline = !!pluginsConfig?.[FRONTLINE_PLUGIN];
  const hasSales = !!pluginsConfig?.[SALES_PLUGIN];

  const skip = searchValue.length < GLOBAL_SEARCH_MIN_LENGTH;
  const limit = GLOBAL_SEARCH_PER_GROUP;

  const { data: customersData, loading: customersLoading } = useQuery<{
    customers: ICursorList<IGlobalSearchCustomer>;
  }>(GLOBAL_SEARCH_CUSTOMERS, {
    variables: { searchValue, limit },
    skip,
  });

  const { data: companiesData, loading: companiesLoading } = useQuery<{
    companies: ICursorList<IGlobalSearchCompany>;
  }>(GLOBAL_SEARCH_COMPANIES, {
    variables: { searchValue, limit },
    skip,
  });

  const { data: productsData, loading: productsLoading } = useQuery<{
    products: IGlobalSearchProduct[];
    productsTotalCount: number;
  }>(GLOBAL_SEARCH_PRODUCTS, {
    variables: { searchValue, perPage: limit },
    skip,
  });

  const { data: teamMembersData, loading: teamMembersLoading } = useQuery<{
    users: ICursorList<IGlobalSearchTeamMember>;
  }>(GLOBAL_SEARCH_TEAM_MEMBERS, {
    variables: { searchValue, limit },
    skip,
  });

  const { data: openData, loading: openLoading } = useQuery<{
    conversations: ICursorList<IGlobalSearchConversation>;
  }>(GLOBAL_SEARCH_CONVERSATIONS, {
    variables: { searchValue, limit },
    skip: skip || !hasFrontline,
  });

  const { data: closedData, loading: closedLoading } = useQuery<{
    conversations: ICursorList<IGlobalSearchConversation>;
  }>(GLOBAL_SEARCH_CONVERSATIONS, {
    variables: { searchValue, limit, status: 'closed' },
    skip: skip || !hasFrontline,
  });

  const { data: ticketsData, loading: ticketsLoading } = useQuery<{
    getTickets: ICursorList<IGlobalSearchTicket>;
  }>(GLOBAL_SEARCH_TICKETS, {
    variables: {
      filter: {
        searchValue,
        cursor: '',
        direction: 'forward',
        limit,
        orderBy: { createdAt: -1 },
      },
    },
    skip: skip || !hasFrontline,
  });

  const { data: channelsData, loading: channelsLoading } = useQuery<{
    getChannels: IGlobalSearchChannel[];
  }>(GLOBAL_SEARCH_CHANNELS, {
    variables: { name: searchValue },
    skip: skip || !hasFrontline,
  });

  const { data: formsData, loading: formsLoading } = useQuery<{
    forms: ICursorList<IGlobalSearchForm>;
  }>(GLOBAL_SEARCH_FORMS, {
    variables: { searchValue, limit },
    skip: skip || !hasFrontline,
  });

  const { data: dealsData, loading: dealsLoading } = useQuery<{
    deals: ICursorList<IGlobalSearchDeal>;
  }>(GLOBAL_SEARCH_DEALS, {
    variables: { search: searchValue, limit },
    skip: skip || !hasSales,
  });

  const customers = customersData?.customers?.list || [];
  const companies = companiesData?.companies?.list || [];
  const products = productsData?.products || [];
  const teamMembers = teamMembersData?.users?.list || [];
  const conversations = [
    ...(openData?.conversations?.list || []),
    ...(closedData?.conversations?.list || []),
  ].slice(0, limit);
  const tickets = ticketsData?.getTickets?.list || [];
  const allChannels = channelsData?.getChannels || [];
  const channels = allChannels.slice(0, limit);
  const forms = formsData?.forms?.list || [];
  const deals = dealsData?.deals?.list || [];

  const loading =
    customersLoading ||
    companiesLoading ||
    productsLoading ||
    teamMembersLoading ||
    openLoading ||
    closedLoading ||
    ticketsLoading ||
    channelsLoading ||
    formsLoading ||
    dealsLoading;

  return {
    loading,
    customers,
    customersTotalCount: customersData?.customers?.totalCount || 0,
    companies,
    companiesTotalCount: companiesData?.companies?.totalCount || 0,
    products,
    productsTotalCount: productsData?.productsTotalCount ?? products.length,
    teamMembers,
    teamMembersTotalCount: teamMembersData?.users?.totalCount || 0,
    conversations,
    conversationsTotalCount:
      (openData?.conversations?.totalCount || 0) +
      (closedData?.conversations?.totalCount || 0),
    tickets,
    ticketsTotalCount: ticketsData?.getTickets?.totalCount || 0,
    channels,
    channelsTotalCount: allChannels.length,
    forms,
    formsTotalCount: formsData?.forms?.totalCount || 0,
    deals,
    dealsTotalCount: dealsData?.deals?.totalCount || 0,
  };
};
