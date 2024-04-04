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

const generateSort = async ({
  type,
  sortField,
  sortDirection,
  searchValue
}) => {
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

const generateAutoCompleteQuery = args => {
  if (args?.usageType !== 'autoComplete') {
    return [];
  }

  return args?.searchValue
    ? args.searchValue
        .split(',')
        .filter(value => {
          if (value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            args.searchValue = args.searchValue.replace(`${value},`, '');
            return value;
          }
        })
        .map(value => ({
          match: {
            primaryEmail: { query: value }
          }
        }))
    : [];
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

const generateList = (type, response) => {
  return response.hits.hits.map(hit => {
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
};

const contactQueries = {
  async contacts(_root, args, { subdomain }: IContext) {
    const { perPage, page } = args;

    let list: ContactType[] = [];
    let autoCompleteList: ContactType[] = [];

    const _page = Number(page || 1);
    const _limit = Number(perPage || 20);

    const autoCompleteQuery = generateAutoCompleteQuery(args);

    for (const type of ['customers', 'companies']) {
      const contactsQueryOptions = await generateQuery(args);
      const contactsSortOptions = await generateSort({ type, ...args });

      if (!!autoCompleteQuery?.length) {
        const response = await fetchEs({
          subdomain,
          action: 'search',
          index: type,
          body: {
            query: {
              bool: {
                should: autoCompleteQuery
              }
            }
          }
        });

        autoCompleteList = [
          ...autoCompleteList,
          ...generateList(type, response)
        ];
      }

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
          ...contactsQueryOptions,
          sort: [contactsSortOptions]
        }
      });

      list = [...list, ...generateList(type, response)];
    }

    return [...autoCompleteList, ...list];
  }
};

export default contactQueries;
