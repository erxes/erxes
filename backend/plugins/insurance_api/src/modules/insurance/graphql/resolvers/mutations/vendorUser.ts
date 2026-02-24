import { IContext } from '~/connectionResolvers';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

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
    // Check if user with this email already exists
    const existingUser = await models.VendorUser.findOne({ email });
    if (existingUser) {
      throw new Error('A vendor user with this email already exists');
    }

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

  vendorUserLogin: Object.assign(
    async (
      _parent: undefined,
      { email, password }: { email: string; password: string },
      { models }: IContext,
    ) => {
      const vendorUser = await models.VendorUser.findOne({
        $or: [{ email: email.toLowerCase() }, { email }, { phone: email }],
      }).populate('vendor');

      if (!vendorUser) {
        throw new Error('Invalid email or password');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const isPasswordValid = await bcrypt.compare(
        hashedPassword,
        vendorUser.password,
      );

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const secret = process.env.JWT_TOKEN_SECRET;

      if (!secret) {
        throw new Error('JWT token secret is not defined');
      }

      const token = jwt.sign(
        { vendorUserId: vendorUser._id, vendorId: vendorUser.vendor },
        secret,
        { expiresIn: '1d' },
      );

      const refreshToken = jwt.sign(
        { vendorUserId: vendorUser._id, vendorId: vendorUser.vendor },
        process.env.JWT_REFRESH_TOKEN_SECRET || 'REFRESH_SECRET',
        { expiresIn: '7d' },
      );

      return {
        token,
        refreshToken,
      };
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
