import { ICompany, Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { ICpCompanyInput } from '~/modules/contacts/@types/company';

export const companyMutations: Record<
  string,
  Resolver<undefined, unknown, IContext>
> = {
  /**
   * Creates a new company
   */
  async companiesAdd(
    _parent: undefined,
    doc: ICompany,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('contactsCreate');

    return await models.Companies.createCompany(doc, user);
  },

  /**
   * Updates a company
   */
  async companiesEdit(
    _parent: undefined,
    { _id, ...doc }: { _id: string } & ICompany,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('contactsUpdate');

    return await models.Companies.updateCompany(_id, doc);
  },

  /**
   * Removes companies
   */
  async companiesRemove(
    _parent: undefined,
    { companyIds }: { companyIds: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('contactsDelete');

    await models.Companies.removeCompanies(companyIds);

    return companyIds;
  },

  /**
   * Merge companies
   */
  async companiesMerge(
    _parent: undefined,
    {
      companyIds,
      companyFields,
    }: { companyIds: string[]; companyFields: ICompany },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('contactsMerge');

    return models.Companies.mergeCompanies(companyIds, companyFields);
  },

  async cpCompaniesAdd(_parent: undefined, doc: ICpCompanyInput, { models, cpUser, clientPortal }: IContext) {
    const user = await models.CPUser.findOne({ _id: cpUser?._id, clientPortalId: clientPortal?._id }).lean();

    if (user?.type !== 'customer' || !user.erxesCustomerId) {
      throw new Error('Permission denied');
    }

    const company = await models.Companies.createCompany(doc);

    await models.Relations.createRelation({
      relation: {
        entities: [
          { contentType: 'core:customer', contentId: user.erxesCustomerId },
          { contentType: 'core:company', contentId: company._id },
        ],
      },
    });

    return company;
  },

  async cpCompaniesEdit(_parent: undefined, { _id, ...doc }: { _id: string } & ICpCompanyInput, { models, cpUser, clientPortal }: IContext) {
    const user = await models.CPUser.findOne({ _id: cpUser?._id, clientPortalId: clientPortal?._id }).lean();

    if (user?.type !== 'customer' || !user.erxesCustomerId) {
      throw new Error('Permission denied');
    }

    const relation = await models.Relations.exists({
      $and: [
        { entities: { $elemMatch: { contentType: 'core:company', contentId: _id } } },
        { entities: { $elemMatch: { contentType: 'core:customer', contentId: user.erxesCustomerId } } },
      ],
    });

    if (!relation) {
      throw new Error('Permission denied');
    }

    return await models.Companies.updateCompany(_id, doc);
  },

  async cpCompaniesRemove(_parent: undefined, { _id }: { _id: string }, { models, cpUser, clientPortal }: IContext) {
    const user = await models.CPUser.findOne({ _id: cpUser?._id, clientPortalId: clientPortal?._id }).lean();

    if (user?.type !== 'customer' || !user.erxesCustomerId) {
      throw new Error('Permission denied');
    }

    const relation = await models.Relations.exists({
      $and: [
        { entities: { $elemMatch: { contentType: 'core:company', contentId: _id } } },
        { entities: { $elemMatch: { contentType: 'core:customer', contentId: user.erxesCustomerId } } },
      ],
    });

    if (!relation) {
      throw new Error('Permission denied');
    }

    await models.Companies.removeCompanies([_id]);

    await models.Relations.cleanRelation({
      contentType: 'core:company',
      contentIds: [_id],
    });

    return _id;
  },
};

companyMutations.cpCompaniesAdd.wrapperConfig = {
  forClientPortal: true,
  cpUserRequired: true,
};

companyMutations.cpCompaniesEdit.wrapperConfig = {
  forClientPortal: true,
  cpUserRequired: true,
};

companyMutations.cpCompaniesRemove.wrapperConfig = {
  forClientPortal: true,
  cpUserRequired: true,
};
