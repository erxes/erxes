import { Model } from 'mongoose';
import { IModels } from '../../connectionResolver';
import {
  IDepartmentDocument,
  departmentSchema,
  unitSchema,
  structureSchema,
  IUnitDocument,
  IBranchDocument,
  branchSchema,
  IStructureDocument
} from './definitions/structures';
import { IUserDocument } from './definitions/users';

export interface IStructureModel extends Model<IStructureDocument> {
  getStructure(doc: any): IStructureDocument;
  createStructure(doc: any, user: IUserDocument): IStructureDocument;
  updateStructure(
    _id: string,
    doc: any,
    user: IUserDocument
  ): IStructureDocument;
  removeStructure(_id: string): IStructureDocument;
}

export const loadStructureClass = (models: IModels) => {
  class Structure {
    /*
     * Get a structure
     */
    public static async getStructure(doc: any) {
      const structure = await models.Structures.findOne(doc);

      if (!structure) {
        throw new Error('Structure not found');
      }

      return structure;
    }

    /*
     * Create an structure
     */
    public static async createStructure(doc: any, user: IUserDocument) {
      const structure = await models.Structures.create({
        ...doc,
        createdAt: new Date(),
        createdBy: user._id
      });

      return structure;
    }

    /*
     * Update an structure
     */
    public static async updateStructure(
      _id: string,
      doc: any,
      user: IUserDocument
    ) {
      await models.Structures.update(
        { _id },
        {
          ...doc,
          updatedAt: new Date(),
          updatedBy: user._id
        }
      );

      return models.Structures.findOne({ _id });
    }

    /*
     * Remove a structure
     */
    public static async removeStructure(_id: string) {
      const structure = await models.Structures.getStructure({ _id });

      return structure.remove();
    }
  }

  structureSchema.loadClass(Structure);

  return structureSchema;
};

// loadStructureClass();

// // tslint:disable-next-line
// const models.Structures = model<IStructureDocument, IStructureModel>(
//   'structures',
//   structureSchema
// );

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

export const loadDepartmentClass = (models: IModels) => {
  class Department {
    /*
     * Get a department
     */
    public static async getDepartment(doc: any) {
      const department = await models.Departments.findOne(doc);

      if (!department) {
        throw new Error('Department not found');
      }

      return department;
    }

    /*
     * Create an department
     */
    public static async createDepartment(doc: any, user: IUserDocument) {
      const department = await models.Departments.create({
        ...doc,
        createdAt: new Date(),
        createdBy: user._id
      });

      return department;
    }

    /*
     * Update a department
     */
    public static async updateDepartment(
      _id: string,
      doc: any,
      user: IUserDocument
    ) {
      await models.Departments.update(
        { _id },
        {
          ...doc,
          updatedAt: new Date(),
          updatedBy: user._id
        }
      );

      return models.Departments.findOne({ _id });
    }

    /*
     * Remove a department
     */
    public static async removeDepartment(_id: string) {
      const department = await models.Departments.getDepartment({ _id });

      await models.Departments.deleteMany({ parentId: department._id });

      return department.remove();
    }
  }

  departmentSchema.loadClass(Department);

  return departmentSchema;
};

export interface IUnitModel extends Model<IUnitDocument> {
  getUnit(doc: any): IUnitDocument;
  createUnit(doc: any, user: IUserDocument): IUnitDocument;
  updateUnit(_id: string, doc: any, user: IUserDocument): IUnitDocument;
  removeUnit(_id: string): IUnitDocument;
}

export const loadUnitClass = (models: IModels) => {
  class Unit {
    /*
     * Get an unit
     */
    public static async getUnit(doc: any) {
      const unit = await models.Units.findOne(doc);

      if (!unit) {
        throw new Error('Unit not found');
      }

      return unit;
    }

    /*
     * Create an unit
     */
    public static async createUnit(doc: any, user: IUserDocument) {
      const unit = await models.Units.create({
        ...doc,
        createdAt: new Date(),
        createdBy: user._id
      });

      return unit;
    }

    /*
     * Update an unit
     */
    public static async updateUnit(_id: string, doc: any, user: IUserDocument) {
      await models.Units.update(
        { _id },
        {
          ...doc,
          updatedAt: new Date(),
          updatedBy: user._id
        }
      );

      return models.Units.findOne({ _id });
    }

    /*
     * Remove an unit
     */
    public static async removeUnit(_id: string) {
      const unit = await models.Units.getUnit({ _id });

      return unit.remove();
    }
  }

  unitSchema.loadClass(Unit);

  return unitSchema;
};

export interface IBranchModel extends Model<IBranchDocument> {
  getBranch(doc: any): IBranchDocument;
  createBranch(doc: any, user: IUserDocument): IBranchDocument;
  updateBranch(_id: string, doc: any, user: IUserDocument): IBranchDocument;
  removeBranch(_id: string): IBranchDocument;
}

export const loadBranchClass = (models: IModels) => {
  class Branch {
    /*
     * Get a branch
     */
    public static async getBranch(doc: any) {
      const branch = await models.Branches.findOne(doc);

      if (!branch) {
        throw new Error('Branch not found');
      }

      return branch;
    }

    /*
     * Create a branch
     */
    public static async createBranch(doc: any, user: IUserDocument) {
      const branch = await models.Branches.create({
        ...doc,
        createdAt: new Date(),
        createdBy: user._id
      });

      return branch;
    }

    /*
     * Update a branch
     */
    public static async updateBranch(
      _id: string,
      doc: any,
      user: IUserDocument
    ) {
      await models.Branches.update(
        { _id },
        {
          ...doc,
          updatedAt: new Date(),
          updatedBy: user._id
        }
      );

      return models.Branches.findOne({ _id });
    }

    /*
     * Remove a branch
     */
    public static async removeBranch(_id: string) {
      const branch = await models.Branches.getBranch({ _id });

      return branch.remove();
    }
  }

  branchSchema.loadClass(Branch);

  return branchSchema;
};
