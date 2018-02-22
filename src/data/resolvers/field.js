import { Users } from '../../db/models';

export default {
  lastUpdatedBy(Field) {
    const { lastUpdatedBy } = Field;

    // Returning user who updated the field last
    return Users.findOne({ _id: lastUpdatedBy });
  },
};
