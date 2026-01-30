import { random } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  ICPUserDocument,
  ICPUserRegisterParams,
} from '@/clientportal/types/cpUser';
import { normalizeEmail } from '@/clientportal/utils';
import { ValidationError } from './errorHandler';
import { assertCPUserEmailPhoneUnique } from './helpers/userUtils';

export class ContactService {
  async findOrCreateCustomer(
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

  async findOrCreateCompany(
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

  private async linkCustomerToUser(
    models: IModels,
    userId: string,
    customerId: string,
  ): Promise<void> {
    await models.CPUser.updateOne(
      { _id: userId },
      { $set: { erxesCustomerId: customerId } },
    );
  }

  private async linkCompanyToUser(
    models: IModels,
    userId: string,
    companyId: string,
  ): Promise<void> {
    await models.CPUser.updateOne(
      { _id: userId },
      { $set: { erxesCompanyId: companyId } },
    );
  }

  async updateCustomerStateToCustomer(
    customerId: string,
    models: IModels,
  ): Promise<void> {
    await models.Customers.updateOne(
      { _id: customerId },
      { $set: { state: 'customer' } },
    );
  }

  private async prepareUserPassword(
    password: string | undefined,
    models: IModels,
  ): Promise<string | undefined> {
    if (!password) {
      return undefined;
    }

    return models.CPUser.generatePassword(password);
  }

  private async handleCustomerUser(
    models: IModels,
    clientPortalId: string,
    document: ICPUserRegisterParams,
    password: string | undefined,
    customer: any,
  ): Promise<ICPUserDocument> {
    const query = { erxesCustomerId: customer._id, clientPortalId };
    let user = await models.CPUser.findOne(query);
    if (user?.isVerified) {
      throw new Error('Cp User already exists');
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

    const hashedPassword = await this.prepareUserPassword(password, models);
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
      throw new Error('Failed to create or update user');
    }

    await this.linkCustomerToUser(models, user._id, customer._id);
    return user;
  }

  private async handleCompanyUser(
    models: IModels,
    clientPortalId: string,
    document: ICPUserRegisterParams,
    password: string | undefined,
    company: any,
  ): Promise<ICPUserDocument> {
    const query = { erxesCompanyId: company._id, clientPortalId };
    let user = await models.CPUser.findOne(query);

    if (user && (user.isEmailVerified || user.isPhoneVerified)) {
      throw new Error('User already exists');
    }

    if (!user) {
      const hashedPassword = await this.prepareUserPassword(password, models);
      user = await models.CPUser.create({
        ...document,
        clientPortalId,
        ...(hashedPassword && { password: hashedPassword }),
      });
    }

    await this.linkCompanyToUser(models, user._id, company._id);
    return user;
  }

  async handleCPContacts(
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
      const customer = await this.findOrCreateCustomer(
        trimmedMail,
        phone,
        models,
      );
      return this.handleCustomerUser(
        models,
        clientPortalId,
        document,
        defaultPassword,
        customer,
      );
    }

    if (type === 'company') {
      const company = await this.findOrCreateCompany(
        trimmedMail,
        phone,
        models,
      );
      return this.handleCompanyUser(
        models,
        clientPortalId,
        document,
        defaultPassword,
        company,
      );
    }

    throw new Error('Invalid user type');
  }
}

export const contactService = new ContactService();
