import { IContext } from '~/connectionResolvers';

export const templateMutations = {
  // Temporary migration mutation - remove after use
  _migrateTemplateCollection: async (
    _parent: undefined,
    _args: any,
    { models }: IContext,
  ) => {
    try {
      // Drop the old index
      await models.Template.collection.dropIndex('insuranceType_1');
      return { success: true, message: 'Index dropped successfully' };
    } catch (err: any) {
      if (err.code === 27) {
        return { success: true, message: 'Index does not exist' };
      }
      throw err;
    }
  },

  createContractTemplate: async (
    _parent: undefined,
    {
      name,
      description,
      htmlContent,
      cssContent,
    }: {
      name: string;
      description?: string;
      htmlContent?: string;
      cssContent?: string;
    },
    { models }: IContext,
  ) => {
    const defaultHtmlContent = `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8">
  <title>{{contractNumber}}</title>
</head>
<body>
  <h1>Даатгалын гэрээ</h1>
  <p>Гэрээний дугаар: {{contractNumber}}</p>
  <p>Харилцагч: {{customer.firstName}} {{customer.lastName}}</p>
  <p>Vendor: {{vendor.name}}</p>
</body>
</html>`;

    return models.Template.create({
      name,
      description: description || '',
      htmlContent: htmlContent || defaultHtmlContent,
      cssContent: cssContent || '',
      status: 'draft',
      version: 1,
    });
  },

  updateContractTemplate: async (
    _parent: undefined,
    {
      id,
      name,
      description,
      htmlContent,
      cssContent,
      status,
    }: {
      id: string;
      name?: string;
      description?: string;
      htmlContent?: string;
      cssContent?: string;
      status?: string;
    },
    { models }: IContext,
  ) => {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (htmlContent !== undefined) updateData.htmlContent = htmlContent;
    if (cssContent !== undefined) updateData.cssContent = cssContent;
    if (status !== undefined) updateData.status = status;

    return models.Template.findByIdAndUpdate(id, updateData, { new: true });
  },

  deleteContractTemplate: async (
    _parent: undefined,
    { id }: { id: string },
    { models }: IContext,
  ) => {
    await models.Template.findByIdAndDelete(id);
    return { success: true };
  },
};
