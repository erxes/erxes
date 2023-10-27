import { IMovementItemDocument } from '../../common/types/asset';
import { IContext } from '../../connectionResolver';
export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Movements.findOne({ _id });
  },

  async branch(movement: IMovementItemDocument, {}, { dataLoaders }: IContext) {
    return (
      (movement.branchId && dataLoaders.branch.load(movement.branchId)) || null
    );
  },
  async customer(
    movement: IMovementItemDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (movement.customerId && dataLoaders.customer.load(movement.customerId)) ||
      null
    );
  },
  async company(
    movement: IMovementItemDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (movement.companyId && dataLoaders.company.load(movement.companyId)) ||
      null
    );
  },
  async teamMember(
    movement: IMovementItemDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (movement.teamMemberId &&
        dataLoaders.teamMember.load(movement.teamMemberId)) ||
      null
    );
  },
  async department(
    movement: IMovementItemDocument,
    {},
    { dataLoaders }: IContext
  ) {
    return (
      (movement.departmentId &&
        dataLoaders.department.load(movement.departmentId)) ||
      null
    );
  }
};
