import { IContext } from '~/connectionResolvers';

// Helper function to generate code from name
const generateCode = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

// Helper function to add key to attributes
const processAttributes = (attributes: any[] = []): any[] => {
  return attributes.map((attr) => ({
    ...attr,
    key: attr.key || generateCode(attr.name),
    subAttributes: attr.subAttributes
      ? processAttributes(attr.subAttributes)
      : undefined,
  }));
};

export const insuranceTypeMutations = {
  createInsuranceType: async (
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

  updateInsuranceType: async (
    _parent: undefined,
    { id, name, attributes }: { id: string; name?: string; attributes?: any[] },
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

  deleteInsuranceType: async (
    _parent: undefined,
    { id }: { id: string },
    { models }: IContext,
  ) => {
    await models.InsuranceType.findByIdAndDelete(id);
    return true;
  },
};
