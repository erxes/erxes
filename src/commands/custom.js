import { connect, disconnect } from '../db/connection';
import { Customers } from '../db/models';

export const customCommand = async () => {
  connect();

  const customers = await Customers.find({
    $or: [{ facebookData: { $exists: true } }, { twitterData: { $exists: true } }],
  });

  for (let customer of customers) {
    let twitterProfile;
    let facebookProfile;

    if (customer.twitterData) {
      twitterProfile = customer.twitterData._doc.profile_image_url;
    }

    if (customer.facebookData) {
      facebookProfile = customer.facebookData._doc.profilePic;
    }

    await Customers.update(
      { _id: customer._id },
      {
        $set: {
          avatar: facebookProfile || twitterProfile,
        },
      },
    );
  }

  disconnect();
};

customCommand();
