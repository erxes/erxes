export const FIELD_MAPPINGS = {
    POST: {
      translatable: ['title', 'content', 'excerpt'],
      searchable: ['title', 'content', 'excerpt'],
    },
    PAGE: {
      translatable: ['name', 'description', 'content'],
      searchable: ['name', 'description'],
    },
    MENU: {
      translatable: ['label'],
      searchable: ['label'],
    },
  };
  
  export class BaseQueryResolver {
    protected context: any;
  
    constructor(context: any) {
      this.context = context;
    }
  
    async getListWithTranslations(
      model: any,
      query: any,
      args: any,
      fieldMapping: any,
    ) {
      const list = await model.find(query).sort({ createdAt: -1 }).lean();
      const totalCount = await model.countDocuments(query);
  
      return {
        list,
        totalCount,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
      };
    }
  
    async getItemWithTranslation(
      model: any,
      query: any,
      language: string,
      fieldMapping: any,
    ) {
      return model.findOne(query).lean();
    }
  }