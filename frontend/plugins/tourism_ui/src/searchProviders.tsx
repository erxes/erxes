import { IconMapPin } from '@tabler/icons-react';
import { defineSearchProvider, ISearchProvider, readCursorList } from 'erxes-ui';

const UNNAMED = 'Unnamed';

type TTourNode = {
  _id: string;
  name?: string | null;
  branchId?: string | null;
};

const toursSearchProvider = defineSearchProvider<TTourNode>({
  key: 'tourism-tours',
  label: 'Tours',
  icon: IconMapPin,
  order: 320,
  selections: [
    {
      alias: 'gs_tourism_tours',
      field: 'bmsTours',
      args: 'name: $searchValue, limit: $limit',
      body: '{ list { _id name branchId } totalCount }',
    },
  ],
  select: (payload) => readCursorList<TTourNode>(payload, 'gs_tourism_tours'),
  toItem: (tour) => {
    if (!tour.branchId) {
      return null;
    }

    return {
      id: tour._id,
      title: tour.name || UNNAMED,
      path: `/tourism/tms/branches/${tour.branchId}?activeTab=tour`,
    };
  },
});

export const SEARCH_PROVIDERS: ISearchProvider[] = [toursSearchProvider];
