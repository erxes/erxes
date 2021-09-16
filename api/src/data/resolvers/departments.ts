import { Users } from '../../db/models';
import { IDepartmentDocument } from '../../db/models/definitions/departments';

export default {
  async users(department: IDepartmentDocument) {
    console.log('department.userIds: ', department.userIds);
    
    const users = await Users.find({ _id: { $in: department.userIds || [] } });

    console.log('users: ', users);

    return users;
  }
};
