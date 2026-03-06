import { escapeRegExp } from 'erxes-api-shared/utils';

export class WebPostQueryBuilder {
  buildQuery(args: any): any {
    const { webId, searchValue, status, featured, type } = args;

    const query: any = { webId };

    if (status) query.status = status;
    if (featured !== undefined) query.featured = featured;
    if (type) query.type = type;

    if (searchValue) {
      const regex = new RegExp(escapeRegExp(searchValue.trim()), 'i');
      query.$or = [
        { title: regex },
        { slug: regex },
        { content: regex },
        { excerpt: regex },
      ];
    }

    return query;
  }
}

export function getWebQueryBuilder(type: 'post') {
  switch (type) {
    case 'post':
      return new WebPostQueryBuilder();
    default:
      throw new Error(`Unknown query builder type: ${type}`);
  }
}