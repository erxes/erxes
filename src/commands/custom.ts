import { connect, disconnect } from '../db/connection';
import { Users } from '../db/models';

export const customCommand = async () => {
  connect();

  const users = await Users.find({});

  for (const user of users) {
    const { details } = user;

    if (details) {
      const { fullName } = details;

      if (fullName) {
        const shortName = fullName.substr(0, 3);

        await Users.update({ _id: user._id }, { $set: { shortName } });
      }
    }
  }

  disconnect();
};

customCommand();
