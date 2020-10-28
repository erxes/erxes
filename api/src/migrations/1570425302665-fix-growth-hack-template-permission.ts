import { connect } from '../db/connection';
import { Permissions } from '../db/models';

module.exports.up = async () => {
  await connect();

  await Permissions.updateMany(
    { action: 'growthHacksAll' },
    {
      $push: {
        requiredActions: {
          $each: [
            'growthHackTemplatesAdd',
            'growthHackTemplatesEdit',
            'growthHackTemplatesRemove',
            'growthHackTemplatesDuplicate',
            'showGrowthHackTemplates'
          ]
        }
      }
    }
  );
};
