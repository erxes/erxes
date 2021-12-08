import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';
import * as sha256 from 'sha256';
import { connect } from '../db/connection';
import { Tags, Customers, Departments, Users, UsersGroups } from '../db/models';

dotenv.config();

const SALT_WORK_FACTOR = 10;

const command = async () => {
  await connect();

  const tag = await Tags.findOne({ name: 'lol' });

  const generatePassword = async (password: string) => {
    const hashPassword = sha256(password);

    return bcrypt.hash(hashPassword, SALT_WORK_FACTOR);
  };

  if (tag) {
    const customers = await Customers.find({ tagIds: [tag._id] });

    let index = 0;

    for (const customer of customers) {
      index++;

      const customFieldsData = customer.customFieldsData;

      let departmentId = '';
      let username = '';
      let password = '';
      let workStartedDate = new Date();
      let fullName = '';

      let operatorPhone = '';
      let email = '';

      if (customFieldsData) {
        if (customFieldsData[0]) {
          const code = customFieldsData[0].value;
          const department = await Departments.findOne({ code });

          if (department) {
            departmentId = department._id;
          }
        }

        if (customFieldsData[2]) {
          const title = customFieldsData[2].value;
          const department = await Departments.findOne({
            parentId: departmentId,
            title: { $regex: new RegExp(title) }
          });

          if (department) {
            departmentId = department._id;
          }
        }

        if (customFieldsData[8]) {
          workStartedDate = new Date(customFieldsData[8].value);
        }

        if (customFieldsData[9]) {
          username = customFieldsData[9].value;
          password = await generatePassword(customFieldsData[9].value);
        }

        if (customFieldsData[10]) {
          fullName = customFieldsData[10].value;
        }

        if (customFieldsData[14]) {
          operatorPhone = customFieldsData[14].value;
        }

        if (customFieldsData[15]) {
          email = customFieldsData[15].value;
        }
      }

      const details = {
        workStartedDate,
        fullName,
        operatorPhone
      };

      let user;

      if (email) {
      } else {
        email = `empty${index}@apu.mn`;
      }

      try {
        const group = (await UsersGroups.findOne({ name: 'workers' })) || {
          _id: 'a'
        };

        user = await Users.create({
          username,
          password,
          details,
          email,
          isActive: true,
          customFieldsData,
          score: 2000,
          groupIds: [group._id]
        });

        await Departments.updateOne(
          { _id: departmentId },
          { $push: { userIds: [user._id] } }
        );
      } catch (e) {
        console.log(e);
      }
    }
  }
};

command();
