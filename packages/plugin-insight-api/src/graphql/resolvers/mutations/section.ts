import { IContext } from '../../../connectionResolver';
import { sendReportsMessage } from '../../../messageBroker';
import { ISection } from '../../../models/definitions/insight';

interface ISectionEdit extends ISection {
  _id: string;
}

const sectionMutations = {
  /**
   * Creates a new section
   */

  async sectionAdd(_root, doc: ISection, { models, user }: IContext) {
    const section = await models.Sections.createSection({
      ...doc,
      createdBy: user._id,
      createdAt: new Date(),
      updatedBy: user._id,
      updatedAt: new Date(),
    });

    return section;
  },

  // /**
  //  * Edits a section
  //  */

  // async sectionEdit(_root, { _id, ...doc }: ISectionEdit, { models }: IContext) {
  //   const section = await models.Sections.updateSection(_id, doc);
  //   return section;
  // },

  /**
   * Removes a section
   */

  async sectionRemove(
    _root,
    { _id }: { _id: string },
    { models, subdomain }: IContext,
  ) {
    const section = await models.Sections.getSection(_id);

    const { type } = section;

    if (type === 'dashboard') {
      await models.Dashboards.updateMany(
        { sectionId: { $in: [_id] } },
        { $unset: { sectionId: 1 } },
      );
    }

    if (type === 'report') {
      await sendReportsMessage({
        subdomain,
        action: 'updateMany',
        data: {
          selector: {
            sectionId: { $in: _id },
          },
          modifier: {
            $unset: { sectionId: 1 },
          },
        },
      });
    }

    return await models.Sections.removeSection(_id);
  },
};

export default sectionMutations;
