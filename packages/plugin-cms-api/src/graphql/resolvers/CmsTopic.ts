import { IContext } from '../index';
import * as _ from 'lodash';
/*
    categories: [CmsCategory]
    allDescendantCategories: [CmsCategory]
*/

const CmsTopic = {
  async categories({ _id }, _, { models }: IContext) {
    return models.Category.find({ topicId: _id._id }).lean();
  },

  async descendantCategories({ _id }, _, { models }: IContext) {
    const subCategories = await models.Category.aggregate([
      {
        $match: {
          topicId: _id
        }
      },
      {
        $graphLookup: {
          from: models.Category.collection.collectionName,
          startWith: '$topicId',
          connectFromField: '_id',
          connectToField: 'parentId',
          as: 'descendantCategories'
        }
      }
    ]);
    return _.flatten(
      subCategories.map(s => s.descendantCategories).filter(d => d)
    );
  }
};

export default CmsTopic;
