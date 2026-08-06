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

interface ICustomersQuery {
  customers: ICursorList<IGlobalSearchCustomer>;
}

interface ICompaniesQuery {
  companies: ICursorList<IGlobalSearchCompany>;
}

interface IProductsQuery {
  products: IGlobalSearchProduct[];
  productsTotalCount: number;
}

interface ITeamMembersQuery {
  users: ICursorList<IGlobalSearchTeamMember>;
}

interface IConversationsQuery {
  conversations: ICursorList<IGlobalSearchConversation>;
}

interface ITicketsQuery {
  getTickets: ICursorList<IGlobalSearchTicket>;
}

interface IChannelsQuery {
  getChannels: IGlobalSearchChannel[];
}

interface IFormsQuery {
  forms: ICursorList<IGlobalSearchForm>;
}

interface IDealsQuery {
  deals: ICursorList<IGlobalSearchDeal>;
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

const listOf = <T,>(page?: ICursorList<T>): T[] => page?.list ?? [];

const countOf = <T,>(page?: ICursorList<T>): number => page?.totalCount ?? 0;

const buildGlobalSearchResult = ({
  loading,
  limit,
  customersData,
  companiesData,
  productsData,
  teamMembersData,
  openData,
  closedData,
  ticketsData,
  channelsData,
  formsData,
  dealsData,
}: {
  loading: boolean;
  limit: number;
  customersData?: ICustomersQuery;
  companiesData?: ICompaniesQuery;
  productsData?: IProductsQuery;
  teamMembersData?: ITeamMembersQuery;
  openData?: IConversationsQuery;
  closedData?: IConversationsQuery;
  ticketsData?: ITicketsQuery;
  channelsData?: IChannelsQuery;
  formsData?: IFormsQuery;
  dealsData?: IDealsQuery;
}): IGlobalSearchResult => {
  const customersPage = customersData?.customers;
  const companiesPage = companiesData?.companies;
  const teamMembersPage = teamMembersData?.users;
  const openPage = openData?.conversations;
  const closedPage = closedData?.conversations;
  const ticketsPage = ticketsData?.getTickets;
  const formsPage = formsData?.forms;
  const dealsPage = dealsData?.deals;

  const products = productsData?.products ?? [];
  const allChannels = channelsData?.getChannels ?? [];

  return {
    loading,
    customers: listOf(customersPage),
    customersTotalCount: countOf(customersPage),
    companies: listOf(companiesPage),
    companiesTotalCount: countOf(companiesPage),
    products,
    productsTotalCount: productsData?.productsTotalCount ?? products.length,
    teamMembers: listOf(teamMembersPage),
    teamMembersTotalCount: countOf(teamMembersPage),
    conversations: [...listOf(openPage), ...listOf(closedPage)].slice(0, limit),
    conversationsTotalCount: countOf(openPage) + countOf(closedPage),
    tickets: listOf(ticketsPage),
    ticketsTotalCount: countOf(ticketsPage),
    channels: allChannels.slice(0, limit),
    channelsTotalCount: allChannels.length,
    forms: listOf(formsPage),
    formsTotalCount: countOf(formsPage),
    deals: listOf(dealsPage),
    dealsTotalCount: countOf(dealsPage),
  };
};

export const useGlobalSearch = (searchValue: string): IGlobalSearchResult => {
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const hasFrontline = Boolean(pluginsConfig?.[FRONTLINE_PLUGIN]);
  const hasSales = Boolean(pluginsConfig?.[SALES_PLUGIN]);

  const skip = searchValue.length < GLOBAL_SEARCH_MIN_LENGTH;
  const skipFrontline = skip || !hasFrontline;
  const skipSales = skip || !hasSales;
  const limit = GLOBAL_SEARCH_PER_GROUP;

  const { data: customersData, loading: customersLoading } =
    useQuery<ICustomersQuery>(GLOBAL_SEARCH_CUSTOMERS, {
      variables: { searchValue, limit },
      skip,
    });

  const { data: companiesData, loading: companiesLoading } =
    useQuery<ICompaniesQuery>(GLOBAL_SEARCH_COMPANIES, {
      variables: { searchValue, limit },
      skip,
    });

  const { data: productsData, loading: productsLoading } =
    useQuery<IProductsQuery>(GLOBAL_SEARCH_PRODUCTS, {
      variables: { searchValue, perPage: limit },
      skip,
    });

  const { data: teamMembersData, loading: teamMembersLoading } =
    useQuery<ITeamMembersQuery>(GLOBAL_SEARCH_TEAM_MEMBERS, {
      variables: { searchValue, limit },
      skip,
    });

  const { data: openData, loading: openLoading } =
    useQuery<IConversationsQuery>(GLOBAL_SEARCH_CONVERSATIONS, {
      variables: { searchValue, limit },
      skip: skipFrontline,
    });

  const { data: closedData, loading: closedLoading } =
    useQuery<IConversationsQuery>(GLOBAL_SEARCH_CONVERSATIONS, {
      variables: { searchValue, limit, status: 'closed' },
      skip: skipFrontline,
    });

  const { data: ticketsData, loading: ticketsLoading } =
    useQuery<ITicketsQuery>(GLOBAL_SEARCH_TICKETS, {
      variables: {
        filter: {
          searchValue,
          cursor: '',
          direction: 'forward',
          limit,
          orderBy: { createdAt: -1 },
        },
      },
      skip: skipFrontline,
    });

  const { data: channelsData, loading: channelsLoading } =
    useQuery<IChannelsQuery>(GLOBAL_SEARCH_CHANNELS, {
      variables: { name: searchValue },
      skip: skipFrontline,
    });

  const { data: formsData, loading: formsLoading } = useQuery<IFormsQuery>(
    GLOBAL_SEARCH_FORMS,
    {
      variables: { searchValue, limit },
      skip: skipFrontline,
    },
  );

  const { data: dealsData, loading: dealsLoading } = useQuery<IDealsQuery>(
    GLOBAL_SEARCH_DEALS,
    {
      variables: { search: searchValue, limit },
      skip: skipSales,
    },
  );

  const loading = [
    customersLoading,
    companiesLoading,
    productsLoading,
    teamMembersLoading,
    openLoading,
    closedLoading,
    ticketsLoading,
    channelsLoading,
    formsLoading,
    dealsLoading,
  ].some(Boolean);

  return buildGlobalSearchResult({
    loading,
    limit,
    customersData,
    companiesData,
    productsData,
    teamMembersData,
    openData,
    closedData,
    ticketsData,
    channelsData,
    formsData,
    dealsData,
  });
};
