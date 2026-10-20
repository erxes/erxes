jest.mock('erxes-api-shared/utils', () => ({
  mongooseStringRandomId: { type: String },
}));

jest.mock('~/connectionResolvers', () => ({}));

import { loadCategoryClass } from '@/knowledgebase/db/models/Category';
import { IModels } from '~/connectionResolvers';

type TCategoryRecord = {
  _id: string;
  topicId?: string;
  parentCategoryId?: string;
};

const buildModels = (records: TCategoryRecord[]) => {
  const Category = {
    getCategory: jest.fn(async (_id: string) => {
      const record = records.find((category) => category._id === _id);

      if (!record) {
        throw new Error('Knowledge base category not found');
      }

      return record;
    }),
    countDocuments: jest.fn(
      async ({ parentCategoryId }: { parentCategoryId: string }) =>
        records.filter(
          (category) => category.parentCategoryId === parentCategoryId,
        ).length,
    ),
    find: jest.fn(({ topicId }: { topicId: string }) => ({
      lean: async () =>
        records.filter((category) => category.topicId === topicId),
    })),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    getSubtreeIds: jest.fn(),
  };
  const Article = { updateMany: jest.fn() };
  const models = { Category, Article } as unknown as IModels;
  const statics = loadCategoryClass(models).statics;

  Category.getSubtreeIds.mockImplementation((_id: string) =>
    statics.getSubtreeIds(_id),
  );

  return { Category, Article, statics };
};

describe('Category.updateDoc', () => {
  const records: TCategoryRecord[] = [
    { _id: 'intro', topicId: 'topic-a' },
    { _id: 'about', topicId: 'topic-a', parentCategoryId: 'intro' },
    { _id: 'rules', topicId: 'topic-a', parentCategoryId: 'intro' },
    { _id: 'faq', topicId: 'topic-b' },
  ];

  it('moves a parent with its subcategories and their articles to the new topic', async () => {
    const { Category, Article, statics } = buildModels(records);

    await statics.updateDoc('intro', { topicId: 'topic-b' }, 'user-1');

    expect(Category.updateOne).toHaveBeenCalledWith(
      { _id: 'intro' },
      {
        $set: expect.objectContaining({
          topicId: 'topic-b',
          parentCategoryId: '',
        }),
      },
    );
    expect(Category.updateMany).toHaveBeenCalledWith(
      { _id: { $in: ['intro', 'about', 'rules'] } },
      { $set: { topicId: 'topic-b' } },
    );
    expect(Article.updateMany).toHaveBeenCalledWith(
      { categoryId: { $in: ['intro', 'about', 'rules'] } },
      { $set: { topicId: 'topic-b' } },
    );
  });

  it('detaches a subcategory from a parent left behind in the old topic', async () => {
    const { Category, statics } = buildModels(records);

    await statics.updateDoc('about', { topicId: 'topic-b' }, 'user-1');

    expect(Category.updateOne).toHaveBeenCalledWith(
      { _id: 'about' },
      { $set: expect.objectContaining({ parentCategoryId: '' }) },
    );
  });

  it('rejects a parent from another topic', async () => {
    const { Category, statics } = buildModels(records);

    await expect(
      statics.updateDoc(
        'about',
        { topicId: 'topic-a', parentCategoryId: 'faq' },
        'user-1',
      ),
    ).rejects.toThrow('Parent category must belong to the same knowledge base');
    expect(Category.updateOne).not.toHaveBeenCalled();
  });

  it('leaves subcategories and articles alone when the topic does not change', async () => {
    const { Category, Article, statics } = buildModels(records);

    await statics.updateDoc(
      'about',
      { topicId: 'topic-a', parentCategoryId: 'intro' },
      'user-1',
    );

    expect(Category.updateMany).not.toHaveBeenCalled();
    expect(Article.updateMany).not.toHaveBeenCalled();
  });
});
