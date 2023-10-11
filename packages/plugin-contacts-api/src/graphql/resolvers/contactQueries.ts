import { fetchEs } from '@erxes/api-utils/src/elasticsearch';
import { IContext } from '../../connectionResolver';
import { getEsTypes } from '../../coc/utils';

type ContactType = {
  _id: string;
  primaryEmail: string;
  primaryPhone: string;
  avatar: string;
  createdAt: string;
  status: string;
  fullName: string;
};

const gneerateSort = ({ type, sortField, sortDirection, searchValue }) => {
  let sort = {};
  const esTypes = getEsTypes(type);
  let fieldToSort = sortField || 'createdAt';

  if (!esTypes[fieldToSort] || esTypes[fieldToSort] === 'email') {
    fieldToSort = `${fieldToSort}.keyword`;
  }

  if (!searchValue) {
    sort = {
      [fieldToSort]: {
        order: sortDirection ? (sortDirection === -1 ? 'desc' : 'asc') : 'desc'
      }
    };
  }
  return sort;
};

const generateQuery = async args => {
  const { searchValue, fieldsMustExist } = args;

  const positiveList: any = [];
  const negativeList: any = [];

  if (searchValue.includes('@')) {
    positiveList.push({
      match_phrase: {
        searchText: {
          query: searchValue
        }
      }
    });
  } else {
    positiveList.push({
      bool: {
        should: [
          {
            match: {
              searchText: {
                query: searchValue
              }
            }
          },
          {
            wildcard: {
              searchText: `*${searchValue.toLowerCase()}*`
            }
          }
        ]
      }
    });
  }

  if (!!fieldsMustExist?.length) {
    for (const field of fieldsMustExist) {
      positiveList.push({
        exists: {
          field
        }
      });
      negativeList.push({
        term: {
          [field]: ''
        }
      });
    }
  }

  return {
    query: {
      bool: {
        must: positiveList,
        must_not: negativeList
      }
    }
  };
};

const generateContentType = (type, source) => {
  switch (type) {
    case 'companies':
      return 'company';
    case 'customers':
      return source?.state || null;
    default:
      break;
  }
};

const generateFullName = (contentType, source) => {
  if (contentType === 'customers') {
    const { firstName, middleName, lastName } = source;

    return `${firstName || ''} ${middleName || ''} ${lastName || ''}`;
  }

  if (contentType === 'companies') {
    return source?.primaryName || '';
  }
  return null;
};

const contactQueries = {
  async contacts(_root, args, { subdomain }: IContext) {
    const { perPage, page } = args;

    let list: ContactType[] = [];

    const _page = Number(page || 1);
    const _limit = Number(perPage || 20);

    for (const type of ['customers', 'companies']) {
      const customersQueryOptions = await generateQuery(args);
      const customersSortOptions = await gneerateSort({ type, ...args });

      if (list.length === _limit) {
        continue;
      }

      const response = await fetchEs({
        subdomain,
        action: 'search',
        index: type,
        body: {
          from: (_page - 1) * _limit,
          size: _limit - list.length,
          ...customersQueryOptions,
          sort: [customersSortOptions]
        }
      });

      const responseList: ContactType[] = response.hits.hits.map(hit => {
        const { primaryEmail, primaryPhone, avatar, createdAt, status } =
          hit._source || {};

        return {
          _id: hit._id,
          primaryEmail,
          primaryPhone,
          avatar,
          createdAt,
          status,
          contentType: generateContentType(type, hit._source || {}),
          fullName: generateFullName(type, hit._source || {})
        };
      });

      list = [...list, ...responseList];
    }
    return list;
  }
};

export default contactQueries;
