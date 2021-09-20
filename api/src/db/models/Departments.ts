import { Model, model } from 'mongoose';
import {
  IDepartmentDocument,
  departmentSchema
} from './definitions/departments';
import { IUserDocument } from './definitions/users';

export interface IDepartmentModel extends Model<IDepartmentDocument> {
  getDepartment(doc: any): IDepartmentDocument;
  createDepartment(doc: any, user: IUserDocument): IDepartmentDocument;
  updateDepartment(
    _id: string,
    doc: any,
    user: IUserDocument
  ): IDepartmentDocument;
  removeDepartment(_id: string): IDepartmentDocument;
}

export const loadClass = () => {
  class Department {
    /*
     * Get a department
     */
    public static async getDepartment(doc: any) {
      const department = await Departments.findOne(doc);

      if (!department) {
        throw new Error('Department not found');
      }

      return department;
    }

    /*
     * Create an department
     */
    public static async createDepartment(doc: any, user: IUserDocument) {
      const department = await Departments.create({
        ...doc,
        createdAt: new Date(),
        createdBy: user._id
      });

      return department;
    }

    /*
     * Update an department
     */
    public static async updateDepartment(
      _id: string,
      doc: any,
      user: IUserDocument
    ) {
      await Departments.update(
        { _id },
        {
          ...doc,
          updatedAt: new Date(),
          updatedBy: user._id
        }
      );

      return Departments.findOne({ _id });
    }

    /*
     * Remove an department
     */
    public static async removeDepartment(_id: string) {
      const department = await Departments.getDepartment({ _id });

      return department.remove();
    }
  }

  departmentSchema.loadClass(Department);
};

loadClass();

// tslint:disable-next-line
const Departments = model<IDepartmentDocument, IDepartmentModel>(
  'departments',
  departmentSchema
);

export default Departments;
