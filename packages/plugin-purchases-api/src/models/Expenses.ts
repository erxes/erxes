import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  IExpense,
  IExpenseDocument,
  expenseSchema
} from './definitions/expenses';

export interface IExpenseModel extends Model<IExpenseDocument> {
  getExpense(_id: string): Promise<IExpenseDocument>;
  createExpense(doc: IExpense): Promise<IExpenseDocument>;
  updateExpense(_id: string, doc: IExpense): Promise<IExpenseDocument>;
  removeExpense(_id: string): void;
}

export const loadExpenseClass = (models: IModels, subdomain: string) => {
  class Expense {
    public static async createExpense(doc: IExpense, createdUserId: string) {
      return models.Expenses.create({
        ...doc,
        createdDate: new Date(),
        createdUserId
      });
    }

    public static async getExpense(_id: string) {
      const expense = await models.Expenses.findOne({ _id });

      if (!expense) {
        throw new Error('expense not found');
      }
      return expense;
    }

    public static async updateExpense(_id: string, doc: IExpense) {
      await models.Expenses.updateOne(
        { _id },
        { $set: doc },
        { runValidators: true }
      );

      return models.Expenses.findOne({ _id });
    }

    public static async removeExpense(_id: string) {
      const data = await models.Expenses.getExpense(_id);

      if (!data) {
        throw new Error(`not found with id ${_id}`);
      }
      return models.Expenses.remove({ _id });
    }
  }

  expenseSchema.loadClass(Expense);

  return expenseSchema;
};
