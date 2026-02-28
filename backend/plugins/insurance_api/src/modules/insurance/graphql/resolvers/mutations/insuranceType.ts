import { randomBytes } from 'crypto';
import { IContext } from '~/connectionResolvers';

// Helper function to generate code from name
const generateCode = (name: string): string => {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!cleaned || cleaned.length === 0) {
    return `type_${Date.now()}_${randomBytes(6).toString('hex')}`;
  }

  return cleaned;
};

// Helper function to add key to attributes
const processAttributes = (attributes: any[] = []): any[] => {
  return attributes.map((attr) => ({
    ...attr,
    key:
      attr.key && attr.key.trim() !== '' ? attr.key : generateCode(attr.name),
    subAttributes: attr.subAttributes
      ? processAttributes(attr.subAttributes)
      : undefined,
  }));
};

export const insuranceTypeMutations = {
  createInsuranceType: Object.assign(
    async (
      _parent: undefined,
      { name, attributes }: { name: string; attributes: any[] },
      { models, user }: IContext,
    ) => {
      // Add role check: if (user.role !== 'admin') throw ForbiddenError
      const code = generateCode(name);
      const processedAttributes = processAttributes(attributes);
      return models.InsuranceType.create({
        name,
        code,
        attributes: processedAttributes,
      });
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  updateInsuranceType: Object.assign(
    async (
      _parent: undefined,
      {
        id,
        name,
        attributes,
      }: { id: string; name?: string; attributes?: any[] },
      { models }: IContext,
    ) => {
      const updateData: any = {};
      if (name) {
        updateData.name = name;
        updateData.code = generateCode(name);
      }
      if (attributes) {
        updateData.attributes = processAttributes(attributes);
      }
      return models.InsuranceType.findByIdAndUpdate(id, updateData, {
        new: true,
      });
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  deleteInsuranceType: Object.assign(
    async (
      _parent: undefined,
      { id }: { id: string },
      { models }: IContext,
    ) => {
      await models.InsuranceType.findByIdAndDelete(id);
      return true;
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
