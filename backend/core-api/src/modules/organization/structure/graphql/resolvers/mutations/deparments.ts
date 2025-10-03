import { IContext } from '~/connectionResolvers';
export const deparmentMutations = {
  async departmentsAdd(_parent: undefined, doc, { user, models }: IContext) {
    const department = await models.Departments.createDepartment(doc, user);

    return department;
  },

  async departmentsEdit(
    _parent: undefined,
    { _id, ...doc },
    { user, models }: IContext,
  ) {
    const department = await models.Departments.updateDepartment(
      _id,
      doc,
      user,
    );

    return department;
  },

  async departmentsRemove(_parent: undefined, { ids }, { models }: IContext) {
    if (!ids.length) {
      throw new Error('You must specify at least one department id to remove');
    }
    const deleteResponse = await models.Departments.removeDepartments(ids);
    return deleteResponse;
  },
};
