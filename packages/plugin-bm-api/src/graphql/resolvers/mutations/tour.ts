import {
  checkPermission,
  requireLogin,
} from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";
import { sendMessage } from "@erxes/api-utils/src/core";

const tourMutations = {
  bmTourAdd: async (
    _root,
    doc,
    { user, docModifier, models, subdomain }: IContext
  ) => {
    const tour = await models.Tours.createTour(docModifier(doc), user);
    const branch = await models.BmsBranch.findById(tour.branchId);

    await sendMessage({
      serviceName: "notifications",
      subdomain,
      action: "send",
      data: {
        notifType: `touradd`,
        title: "Тур үүслээ",
        content: `${tour.name} тур үүслээ,хэрэглэгч үүсгэлэ${user.details?.firstName || user.email || "."}`,
        action: `Reminder:`,
        link: `/tour?id=${tour._id}`,
        createdUser: user,
        // exclude current user
        contentType: "bm:tour",
        contentTypeId: tour._id,
        receivers: [...(branch?.user1Ids || []), ...(branch?.user2Ids || [])],
      },
    });
    return tour;
  },

  bmTourEdit: async (
    _root,
    { _id, ...doc },
    { models, user, subdomain }: IContext
  ) => {
    const updated = await models.Tours.updateTour(_id, doc as any);
    return updated;
  },
  bmTourViewCount: async (
    _root,
    { _id, ...doc },
    { models, user, subdomain }: IContext
  ) => {
    return await models.Tours.findOneAndUpdate(
      { _id: _id },
      { $inc: { viewCount: 1 } }
    ).exec();
  },
  bmTourRemove: async (
    _root,
    { ids }: { ids: string[] },
    { models, user, subdomain }: IContext
  ) => {
    const tours = await models.Tours.find({ _id: { $in: ids } });

    await models.Tours.removeTour(ids);
    const branchs = await models.BmsBranch.find({ _id: { $in: ids } });
    const names = tours.map(x => x.name).join(",");
    let allUsers: string[] = [];
    for (const branch of branchs) {
      const users = [...(branch?.user1Ids || []), ...(branch?.user2Ids || [])];
      allUsers = [...allUsers, ...users];
    }
    await sendMessage({
      serviceName: "notifications",
      subdomain,
      action: "send",
      data: {
        notifType: `tourremove`,
        title: "Тур устгав",
        content: `${names} турууд устдаа,хэрэглэгч ${user.details?.firstName || user.email || "."}`,
        action: `Reminder:`,
        link: `/tour`,
        createdUser: user,
        // exclude current user
        contentType: "bm:tour",
        contentTypeId: "deleteall",
        receivers: allUsers || [],
      },
    });

    return ids;
  },
};

export default tourMutations;
