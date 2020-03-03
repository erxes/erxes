import { PUBLISH_STATUSES } from '../../../../../erxes-api/src/db/models/definitions/constants';
import { Automations, Shapes } from '../../../models';
import { IAutomation, IShape } from '../../../models/definitions/Automations';

interface IAutomationsEdit extends IAutomation {
  _id: string;
}

interface IShapesEdit extends IShape {
  _id: string;
}

const automationMutations = {
  /**
   * Adds automation object and also adds an activity log
   */
  async automationsAdd(_root, args: IAutomation) {
    const automation = await Automations.createAutomation(args);

    return automation;
  },

  /**
   * Updates automation object
   */
  async automationsEdit(_root, { _id, ...doc }: IAutomationsEdit) {
    const updated = await Automations.updateAutomation(_id, doc);

    return updated;
  },

  /**
   * Remove a automation
   */
  async automationsRemove(_root, { _id }: { _id: string }) {
    const removed = await Automations.removeAutomation(_id);
    return removed;
  },

  /**
   * Publish a automation
   */
  async automationsPublish(_root, { _id, isPublish }: { _id: string; isPublish: boolean }) {
    const automation = await Automations.getAutomation(_id);
    if (!isPublish) {
      // todo: check queue in this.defaultTrigger's queue stop

      Automations.updateAutomation(_id, { ...automation, status: PUBLISH_STATUSES.DRAFT });
      return Automations.getAutomation(_id);
    }

    // check validation
    Automations.updateAutomation(_id, {
      ...automation,
      status: PUBLISH_STATUSES.PUBLISH,
      publishedAt: new Date(Date.now()),
    });

    return Automations.getAutomation(_id);
  },

  /**
   * Adds shapes object
   */
  async shapesAdd(_root, args: IShape) {
    const shape = await Shapes.createShape(args);
    return shape;
  },

  /**
   * Updates shape object
   */
  async shapesEdit(_root, { _id, ...doc }: IShapesEdit) {
    const updated = await Shapes.updateShape(_id, doc);
    return updated;
  },

  /**
   * Remove a shape
   */
  async shapesRemove(_root, { _id }: { _id: string }) {
    const removed = await Shapes.removeShape(_id);
    return removed;
  },
};

export default automationMutations;
