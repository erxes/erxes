import { random } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  ICPUserDocument,
  ICPUserRegisterParams,
} from '@/clientportal/types/cpUser';
import { normalizeEmail } from '@/clientportal/utils';

export class ContactService {
  async findOrCreateCustomer(
    email: string,
    phone: string,
    models: IModels,
  ): Promise<any> {
    const customer = await models.Customers.findOne({
      $or: [{ primaryEmail: email }, { primaryPhone: phone }],
    });

    if (customer) {
      return customer;
    }

    return models.Customers.create({
      primaryEmail: email,
      primaryPhone: phone,
    });
  }

  async findOrCreateCompany(
    email: string,
    phone: string,
    models: IModels,
  ): Promise<any> {
    const company = await models.Companies.findOne({ email, phone });

    if (company) {
      return company;
    }

    return models.Companies.create({ email, phone });
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
      throw new Error('User already exists');
    }

    const hashedPassword = await this.prepareUserPassword(password, models);
    const userData = {
      ...document,
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
