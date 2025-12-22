import { IContext } from '~/connectionResolvers';
import * as bcrypt from 'bcryptjs';

export const vendorUserMutations = {
  createVendorUser: async (
    _parent: undefined,
    {
      name,
      email,
      phone,
      password,
      vendorId,
      role,
    }: {
      name?: string;
      email: string;
      phone?: string;
      password: string;
      vendorId: string;
      role?: string;
    },
    { models }: IContext,
  ) => {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const vendorUser = await models.VendorUser.create({
      name,
      email,
      phone,
      password: hashedPassword,
      vendor: vendorId,
      role: role || 'user',
    });

    return vendorUser.populate('vendor');
  },

  updateVendorUser: async (
    _parent: undefined,
    {
      id,
      name,
      email,
      phone,
      password,
      role,
    }: {
      id: string;
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      role?: string;
    },
    { models }: IContext,
  ) => {
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    return models.VendorUser.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate('vendor');
  },

  deleteVendorUser: async (
    _parent: undefined,
    { id }: { id: string },
    { models }: IContext,
  ) => {
    await models.VendorUser.findByIdAndDelete(id);
    return true;
  },
};
