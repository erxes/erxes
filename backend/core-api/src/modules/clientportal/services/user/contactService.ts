import { random } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  ICPUserDocument,
  ICPUserRegisterParams,
} from '@/clientportal/types/cpUser';
import { normalizeEmail } from '@/clientportal/utils';
import { ValidationError } from '@/clientportal/services/errorHandler';
import { assertCPUserEmailPhoneUnique } from '@/clientportal/services/helpers/userUtils';

async function prepareUserPassword(
  password: string | undefined,
  models: IModels,
): Promise<string | undefined> {
  if (!password) {
    return undefined;
  }
  return models.CPUser.generatePassword(password);
}

async function linkCustomerToUser(
  models: IModels,
  userId: string,
  customerId: string,
): Promise<void> {
  await models.CPUser.updateOne(
    { _id: userId },
    { $set: { erxesCustomerId: customerId } },
  );
}

async function linkCompanyToUser(
  models: IModels,
  userId: string,
  companyId: string,
): Promise<void> {
  await models.CPUser.updateOne(
    { _id: userId },
    { $set: { erxesCompanyId: companyId } },
  );
}

async function handleCustomerUser(
  models: IModels,
  clientPortalId: string,
  document: ICPUserRegisterParams,
  password: string | undefined,
  customer: any,
): Promise<ICPUserDocument> {
  const query = { erxesCustomerId: customer._id, clientPortalId };
  let user = await models.CPUser.findOne(query);
  if (user?.isVerified) {
    throw new ValidationError('Cp User already exists');
  }

  const normalizedEmail = document.email
    ? normalizeEmail(document.email)
    : undefined;

  await assertCPUserEmailPhoneUnique(
    clientPortalId,
    {
      ...(normalizedEmail && { email: normalizedEmail }),
      ...(document.phone && { phone: document.phone }),
    },
    user?._id,
    models,
  );

  const hashedPassword = await prepareUserPassword(password, models);
  const userData = {
    ...document,
    ...(normalizedEmail && { email: normalizedEmail }),
    clientPortalId,
    ...(hashedPassword && { password: hashedPassword }),
  };

  if (user && !user.isVerified) {
    user = await models.CPUser.findOneAndUpdate(
      { _id: user._id },
      { $set: userData },
      { new: true },
    );
  } else if (!user) {
    user = await models.CPUser.create(userData);
  }

  if (!user) {
    throw new ValidationError('Failed to create or update user');
  }

  await linkCustomerToUser(models, user._id, customer._id);
  return user;
}

async function handleCompanyUser(
  models: IModels,
  clientPortalId: string,
  document: ICPUserRegisterParams,
  password: string | undefined,
  company: any,
): Promise<ICPUserDocument> {
  const query = { erxesCompanyId: company._id, clientPortalId };
  let user = await models.CPUser.findOne(query);

  if (user && (user.isEmailVerified || user.isPhoneVerified)) {
    throw new ValidationError('User already exists');
  }

  if (!user) {
    const hashedPassword = await prepareUserPassword(password, models);
    user = await models.CPUser.create({
      ...document,
      clientPortalId,
      ...(hashedPassword && { password: hashedPassword }),
    });
  }

  await linkCompanyToUser(models, user._id, company._id);
  return user;
}

export async function findOrCreateCustomer(
  email: string,
  phone: string,
  models: IModels,
): Promise<any> {
  const queryConditions: any[] = [];

  if (email) {
    queryConditions.push({ primaryEmail: email });
  }

  if (phone) {
    queryConditions.push({ primaryPhone: phone });
  }

  const customer =
    queryConditions.length > 0
      ? await models.Customers.findOne({ $or: queryConditions })
      : null;

  if (customer) {
    return customer;
  }

  const createData: any = {};
  if (email) {
    createData.primaryEmail = email;
  }
  if (phone) {
    createData.primaryPhone = phone;
  }

  return models.Customers.create(createData);
}

export async function findOrCreateCompany(
  email: string,
  phone: string,
  models: IModels,
): Promise<any> {
  const queryConditions: any = {};

  if (email) {
    queryConditions.email = email;
  }

  if (phone) {
    queryConditions.phone = phone;
  }

  const company =
    Object.keys(queryConditions).length > 0
      ? await models.Companies.findOne(queryConditions)
      : null;

  if (company) {
    return company;
  }

  const createData: any = {};
  if (email) {
    createData.email = email;
  }
  if (phone) {
    createData.phone = phone;
  }

  return models.Companies.create(createData);
}

export async function updateCustomerStateToCustomer(
  customerId: string,
  models: IModels,
): Promise<void> {
  await models.Customers.updateOne(
    { _id: customerId },
    { $set: { state: 'customer' } },
  );
}

export async function handleCPContacts(
  models: IModels,
  clientPortalId: string,
  document: ICPUserRegisterParams,
  password?: string,
): Promise<ICPUserDocument> {
  const defaultPassword = password || random('Aa0!', 8);
  const { type = 'customer' } = document;
  const trimmedMail = document.email ? normalizeEmail(document.email) : '';
  const phone = document.phone || '';

  if (type === 'customer') {
    const customer = await findOrCreateCustomer(trimmedMail, phone, models);
    return handleCustomerUser(
      models,
      clientPortalId,
      document,
      defaultPassword,
      customer,
    );
  }

  if (type === 'company') {
    const company = await findOrCreateCompany(trimmedMail, phone, models);
    return handleCompanyUser(
      models,
      clientPortalId,
      document,
      defaultPassword,
      company,
    );
  }

  throw new ValidationError('Invalid user type');
}
