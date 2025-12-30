import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';

import mongoose from 'mongoose';


import { ICustomerDocument } from '@/insurance/@types/customer';
import { IInsuranceTypeDocument } from '@/insurance/@types/insuranceType';
import { IProductDocument } from '@/insurance/@types/product';
import { IRiskTypeDocument } from '@/insurance/@types/riskType';
import { IVendorDocument } from '@/insurance/@types/vendor';
import { IVendorUserDocument } from '@/insurance/@types/vendorUser';

import { IContractModel, loadContractClass } from '@/insurance/db/models/contract';
import { ICustomerModel, loadCustomerClass } from '@/insurance/db/models/customer';
import { IInsuranceTypeModel, loadInsuranceTypeClass } from '@/insurance/db/models/insuranceType';
import { IProductModel, loadProductClass } from '@/insurance/db/models/product';
import { IRiskTypeModel, loadRiskTypeClass } from '@/insurance/db/models/riskType';
import { IVendorModel, loadVendorClass } from '@/insurance/db/models/vendor';
import { IVendorUserModel, loadVendorUserClass } from '@/insurance/db/models/vendorUser';
import { IContractDocument } from '@/insurance/@types/contract';


export interface IModels {
  Contract: IContractModel;
  InsuranceType: IInsuranceTypeModel;
  RiskType: IRiskTypeModel;
  Product: IProductModel;
  Vendor: IVendorModel;
  VendorUser: IVendorUserModel;
  Customer: ICustomerModel;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Contract = db.model<IContractDocument, IContractModel>(
    'contracts',
    loadContractClass(models),
  );

  models.InsuranceType = db.model<IInsuranceTypeDocument, IInsuranceTypeModel>(
    'insurance_types',
    loadInsuranceTypeClass(models),
  );

  models.RiskType = db.model<IRiskTypeDocument, IRiskTypeModel>(
    'risk_types',
    loadRiskTypeClass(models),
  );

  models.Product = db.model<IProductDocument, IProductModel>(
    'products',
    loadProductClass(models),
  );

  models.Vendor = db.model<IVendorDocument, IVendorModel>(
    'vendors',
    loadVendorClass(models),
  );

  models.VendorUser = db.model<IVendorUserDocument, IVendorUserModel>(
    'vendor_users',
    loadVendorUserClass(models),
  );

  models.Customer = db.model<ICustomerDocument, ICustomerModel>(
    'insurance_customers',
    loadCustomerClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
