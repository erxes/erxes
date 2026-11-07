import type { IModels } from '~/connectionResolvers';
import type { ITemplateCategory } from '../../../@types';
import { loadTemplateCategoryClass } from '../Category';

const existing = [
  { _id: 'self', code: 'SAME' },
  { _id: 'other', code: 'TAKEN' },
];
type CategoryFilter = { code: string; _id?: { $ne: string } };

const validate = (input: {
  _id?: string;
  category: ITemplateCategory;
}): Promise<void> => {
  const models = {
    TemplateCategory: {
      findOne: (filter: CategoryFilter) => ({
        lean: async () =>
          existing.find(
            (category) =>
              category.code === filter.code && category._id !== filter._id?.$ne,
          ) || null,
      }),
    },
  } as unknown as IModels;
  const schema = loadTemplateCategoryClass(models);
  const validateCategory = schema.statics.validateTemplateCategory as (
    doc: typeof input,
  ) => Promise<void>;
  return validateCategory(input);
};

const category = (code: string): ITemplateCategory => ({
  name: 'Category',
  code,
  parentId: '',
  createdBy: 'user',
  updatedBy: 'user',
});

it('allows an existing category to keep its own code while updating', async () => {
  await expect(
    validate({ _id: 'self', category: category('SAME') }),
  ).resolves.toBeUndefined();
});

it('still rejects another category code during an update', async () => {
  await expect(
    validate({ _id: 'self', category: category('TAKEN') }),
  ).rejects.toThrow('Code must be unique');
});

it('still rejects duplicate codes during creation', async () => {
  await expect(validate({ category: category('SAME') })).rejects.toThrow(
    'Code must be unique',
  );
});
