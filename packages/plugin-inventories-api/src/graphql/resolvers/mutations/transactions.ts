import { IContext } from '../../../connectionResolver';

export interface ITransactionItemParams {
  branchId: string;
  departmentId: string;
  remainderId: string;
  productId: string;
  count: number;
  isDebit: boolean;
  uomId: string;
}

export interface ITransactionAddParams {
  contentType: string;
  contentId: string;
  status: string;
  products: ITransactionItemParams[];
}

const transactionMutations = {
  async transactionAdd(
    _root: any,
    params: ITransactionAddParams,
    { models, user }: IContext
  ) {
    const { status, contentType, contentId, products } = params;

    const result = await models.Transactions.create({
      status,
      contentType,
      contentId,
      createdAt: new Date(),
      createdBy: user._id
    });

    products.map(async (item: ITransactionItemParams) => {
      const resultRemainder = await models.Remainders.findById(
        item.remainderId
      );

      console.log('Transaction - resultRemainder: ', resultRemainder);

      const doc = {
        branchId: item.branchId,
        departmentId: item.departmentId,
        productId: item.productId,
        count: item.count,
        uomId: item.uomId
      };

      if (resultRemainder) {
        await models.Remainders.updateRemainder(item.remainderId, doc);
      } else {
        await models.Remainders.createRemainder(doc);
      }

      await models.TransactionItems.createItem({
        branchId: item.branchId,
        departmentId: item.departmentId,
        transactionId: result._id,
        productId: item.productId,
        count: item.count,
        uomId: item.uomId,
        isDebit: true
      });
    });

    return result;
  }
};

export default transactionMutations;
