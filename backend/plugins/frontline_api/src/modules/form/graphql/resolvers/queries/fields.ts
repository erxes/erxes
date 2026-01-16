import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

interface IFieldsDefaultColmns {
  [index: number]: { name: string; label: string; order: number };
}

export interface IFieldsQuery {
  contentType: string;
  contentTypeId?: string;
  isVisible?: boolean;
  isDefinedByErxes?: boolean;
  searchable?: boolean;
  isVisibleToCreate?: boolean;
  groupId?: any;
  isDisabled?: boolean;
}

export const fieldQueries = {
  //   async fieldsGetTypes() {
  //     const services = await getServices();
  //     const fieldTypes: Array<{ description: string; contentType: string }> = [];

  //     for (const serviceName of services) {
  //       const service = await getService(serviceName);
  //       const meta = service.config?.meta || {};

  //       if (meta && meta.forms) {
  //         const types = meta.forms.types || [];

  //         for (const type of types) {
  //           fieldTypes.push({
  //             description: type.description,
  //             contentType: `${serviceName}:${type.type}`,
  //           });
  //         }
  //       }
  //     }

  //     return fieldTypes;
  //   },

  //   async getFieldsInputTypes() {
  //     const services = await getServices();
  //     const fieldInputTypes: Array<{ value: string; label: string }> = [
  //       { value: 'input', label: 'Input' },
  //       { value: 'list', label: 'String List' },
  //       { value: 'objectList', label: 'Object List' },
  //       { value: 'textarea', label: 'Text area' },
  //       { value: 'select', label: 'Select' },
  //       { value: 'multiSelect', label: 'Multiple select' },
  //       { value: 'labelSelect', label: 'Label select' },
  //       { value: 'check', label: 'Checkbox' },
  //       { value: 'radio', label: 'Radio button' },
  //       { value: 'file', label: 'File' },
  //       { value: 'customer', label: 'Customer' },
  //       { value: 'product', label: 'Product' },
  //       { value: 'users', label: 'Team members' },
  //       { value: 'branch', label: 'Branch' },
  //       { value: 'department', label: 'Department' },
  //       { value: 'map', label: 'Location/Map' },
  //       {
  //         value: 'isCheckUserTicket',
  //         label: "Show only the user's assigned(created) tickets",
  //       },
  //     ];

  //     for (const serviceName of services) {
  //       const service = await getService(serviceName);
  //       const meta = service.config?.meta || {};

  //       if (meta && meta.forms) {
  //         const types = meta.forms?.extraFieldTypes || [];

  //         for (const type of types) {
  //           fieldInputTypes.push({
  //             value: type.value,
  //             label: type.label,
  //           });
  //         }
  //       }
  //     }

  //     return fieldInputTypes;
  //   },

  /**
   * Fields list
   */
  async frontlineFields(
    _root,
    {
      contentType,
      contentTypeId,
      isVisible,
      isVisibleToCreate,
      searchable,
      isDefinedByErxes,
      isDisabled,
    }: {
      contentType: string;
      contentTypeId: string;
      isVisible: boolean;
      isVisibleToCreate: boolean;
      searchable: boolean;
      pipelineId: string;
      groupIds: string[];
      isDefinedByErxes: boolean;
      isDisabled: boolean;
    },
    { models }: IContext,
  ) {
    console.log('wahhahahahha');
    const query: IFieldsQuery = { contentType };

    if (contentType) {
      query.contentType = contentType;
    }

    if (contentTypeId) {
      query.contentTypeId = contentTypeId;
    }

    if (isVisible) {
      query.isVisible = isVisible;
    }

    if (searchable !== undefined) {
      query.searchable = searchable;
    }

    if (isVisibleToCreate !== undefined) {
      query.isVisibleToCreate = isVisibleToCreate;
    }

    if (isDefinedByErxes) {
      query.isDefinedByErxes = isDefinedByErxes;
    }
    if (isDisabled) {
      query.isDisabled = isDisabled;
    }
    console.log(query, 'query........');
    await models.Fields.find(query);

    return cursorPaginate({
      model: models.Fields,
      params: {
        orderBy: { createdAt: 1 },
      },
      query: { ...query },
    });
  },

  /**
   * Generates all field choices base on given kind.
   */
  //   async fieldsCombinedByContentType(
  //     _root,
  //     args,
  //     { models, subdomain }: IContext,
  //   ) {
  //     return fieldsCombinedByContentType(models, subdomain, args);
  //   },

  //   /**
  //    * Default list columns config
  //    */
  //   async fieldsDefaultColumnsConfig(
  //     _root,
  //     { contentType }: { contentType: string },
  //   ): Promise<IFieldsDefaultColmns> {
  //     const [serviceName, type] = contentType.split(':');
  //     const service = await getService(serviceName);

  //     if (!service) {
  //       return [];
  //     }

  //     const meta = service.config?.meta || {};

  //     if (meta.forms && meta.forms.defaultColumnsConfig) {
  //       return meta.forms.defaultColumnsConfig[type] || [];
  //     }

  //     return [];
  //   },

  //   async fieldsGetDetail(_root, { _id, code }, { models }: IContext) {
  //     let field = await models.Fields.findOne({ code });

  //     if (!field) {
  //       field = await models.Fields.findOne({ _id });
  //     }

  //     return field;
  //   },

  //   async fieldsGetRelations(
  //     _root,
  //     {
  //       contentType,
  //       isVisibleToCreate,
  //       isVisible,
  //     }: {
  //       contentType: string;
  //       isVisibleToCreate: boolean;
  //       isVisible: boolean;
  //     },
  //     { models }: IContext,
  //   ) {
  //     const query = {
  //       contentType,
  //       isDefinedByErxes: true,
  //       relationType: { $exists: true },
  //     } as any;
  //     if (isVisible !== undefined) {
  //       query.isVisible = isVisible;
  //     }
  //     if (isVisibleToCreate !== undefined) {
  //       query.isVisibleToCreate = isVisibleToCreate;
  //     }
  //     return models.Fields.find({
  //       ...query,
  //     });
  //   },

  //   async fieldByCode(
  //     _root,
  //     { contentType, code }: { contentType: string; code: string },
  //     { models }: IContext,
  //   ) {
  //     return models.Fields.findOne({ contentType, code });
  //   },
};

//checkPermission(fieldsGroupQueries, 'fieldsGroups', 'showForms', []);
