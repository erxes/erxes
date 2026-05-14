import { IModels } from '~/connectionResolvers';

export const dropProductCodeIndex = async (models: IModels) => {
  try {
    await models.Product.collection.dropIndex('code_1');
    console.log('Successfully dropped code_1 index from products collection');
  } catch (error: any) {
    if (error.code === 27 || error.message.includes('index not found')) {
      console.log('code_1 index does not exist, skipping...');
    } else {
      console.error('Error dropping code_1 index:', error);
    }
  }
};
