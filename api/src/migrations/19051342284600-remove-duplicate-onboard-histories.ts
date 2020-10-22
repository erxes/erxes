import { connect } from '../db/connection';
import { OnboardingHistories, Users } from '../db/models';

module.exports.up = async () => {
  await connect();

  const users = await Users.find({});

  for (const user of users) {
    const entries = (await OnboardingHistories.find({ userId: user._id })) || [];
    const userInfo = user.username || user.email || user._id;

    console.log(`Found "${entries.length}" onboard history entries for user "${userInfo}"`);

    // if multiple entries are found leave only one
    if (entries.length > 1) {
      const completed = entries.find(item => item.isCompleted);

      if (completed) {
        await OnboardingHistories.remove({ _id: { $ne: completed._id } });
      } else {
        // leave the first entry
        await OnboardingHistories.remove({ _id: { $ne: entries[0]._id } });
      }
    }
  } // end users loop
};
