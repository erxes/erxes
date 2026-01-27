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
      const user = await models.VendorUser.findOne({ email }).populate(
        'vendor',
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const JWT_SECRET = process.env.JWT_TOKEN_SECRET || 'your-secret-key';
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          vendorId: user.vendor,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' },
      );

      const refreshToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: '30d' },
      );

      return {
        token,
        refreshToken,
        user,
      };
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
