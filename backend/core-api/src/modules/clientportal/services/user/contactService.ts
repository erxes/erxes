import { ValidationError } from '@/clientportal/services/errorHandler';
import { assertCPUserEmailPhoneUnique } from '@/clientportal/services/helpers/userUtils';
import {
  ICPUserDocument,
  ICPUserRegisterParams,
} from '@/clientportal/types/cpUser';
import { normalizeEmail } from '@/clientportal/utils';
import { random } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

// Mirrors the email regex on the cpUser schema so reverse sync never writes
// an email the CP user model itself would reject.
const CP_USER_EMAIL_REGEX =
  /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,10})+$/;

export async function syncCPUserContactToCustomer(
  models: IModels,
  cpUser: Pick<
    ICPUserDocument,
    'email' | 'phone' | 'firstName' | 'lastName' | 'erxesCustomerId'
  >,
): Promise<void> {
  if (!cpUser.erxesCustomerId) {
    return;
  }

  const set: Record<string, string> = {};
  const addToSet: Record<string, string> = {};

  if (cpUser.email) {
    set.primaryEmail = cpUser.email;
    addToSet.emails = cpUser.email;
  }

  if (cpUser.phone) {
    set.primaryPhone = cpUser.phone;
    addToSet.phones = cpUser.phone;
  }

  if (cpUser.firstName) {
    set.firstName = cpUser.firstName;
  }

  if (cpUser.lastName) {
    set.lastName = cpUser.lastName;
  }

  if (Object.keys(set).length === 0) {
    return;
  }

  // Direct updateOne (not updateCustomer) so the reverse sync isn't re-triggered
  await models.Customers.updateOne(
    { _id: cpUser.erxesCustomerId },
    { $set: set, $addToSet: addToSet },
  );
}

export async function syncCustomerContactToCPUsers(
  models: IModels,
  customerId: string,
  doc: {
    primaryEmail?: string;
    primaryPhone?: string;
    firstName?: string;
    lastName?: string;
  },
): Promise<void> {
  const set: Record<string, string> = {};

  if (doc.primaryEmail !== undefined) {
    const email = normalizeEmail(doc.primaryEmail);
    if (email && CP_USER_EMAIL_REGEX.test(email)) {
      set.email = email;
    }
  }

  if (doc.primaryPhone !== undefined) {
    const phone = (doc.primaryPhone || '').trim();
    if (phone) {
      set.phone = phone;
    }
  }

  if (doc.firstName !== undefined && doc.firstName.trim()) {
    set.firstName = doc.firstName.trim();
  }

  if (doc.lastName !== undefined && doc.lastName.trim()) {
    set.lastName = doc.lastName.trim();
  }

  if (Object.keys(set).length === 0) {
    return;
  }

  await models.CPUser.updateMany(
    { erxesCustomerId: customerId },
    { $set: set },
  );
}

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
  const { username, userType, ...restDocument } = document;
  const userData = {
    ...restDocument,
    type: userType || 'customer',
    ...(username != null && { username }),
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

  // Customer may have been matched by only one identifier (e.g. phone); make
  // sure its primary email/phone match the CP user values (CP user wins).
  await syncCPUserContactToCustomer(models, {
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    erxesCustomerId: customer._id,
  });

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
    const { username, userType, ...restDocument } = document;
    user = await models.CPUser.create({
      ...restDocument,
      type: userType || 'company',
      ...(username != null && { username }),
      clientPortalId,
      ...(hashedPassword && { password: hashedPassword }),
    });
  }

  await linkCompanyToUser(models, user._id, company._id);
  return user;
}

export async function findOrCreateCustomer(
  document: ICPUserRegisterParams,
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

  const createData: any = {
    ...document,
  };

  if (email) {
    createData.primaryEmail = email;
  }

  if (phone) {
    createData.primaryPhone = phone;
  }

  return models.Customers.createCustomer(createData);
}

export async function findOrCreateCompany(
  document: ICPUserRegisterParams,
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

  const company =
    queryConditions.length > 0
      ? await models.Companies.findOne({ $or: queryConditions })
      : null;

  if (company) {
    return company;
  }

  const createData: any = {
    ...document,
    primaryName: document.username || '',
  };

  if (email) {
    createData.primaryEmail = email;
  }

  if (phone) {
    createData.primaryPhone = phone;
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
  const { userType = 'customer' } = document;

  const trimmedMail = document.email ? normalizeEmail(document.email) : '';
  const phone = document.phone || '';

  if (userType === 'customer') {
    const customer = await findOrCreateCustomer(
      document,
      trimmedMail,
      phone,
      models,
    );
    return handleCustomerUser(
      models,
      clientPortalId,
      document,
      defaultPassword,
      customer,
    );
  }

  if (userType === 'company') {
    const company = await findOrCreateCompany(
      document,
      trimmedMail,
      phone,
      models,
    );
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
