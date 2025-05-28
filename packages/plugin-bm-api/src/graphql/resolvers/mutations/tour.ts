import {
  checkPermission,
  requireLogin
} from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";
import { sendMessage } from "@erxes/api-utils/src/core";
import { putCreateLog, putDeleteLog, putUpdateLog } from "../../../logUtils";

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
        content: `${tour.name} тур үүслээ,хэрэглэгч үүсгэлээ. ${user.details?.firstName || user.email || "."}`,
        action: `Reminder:`,
        link: `/tour?id=${tour._id}`,
        createdUser: user,
        // exclude current user
        contentType: "bm:tour",
        contentTypeId: tour._id,
        receivers: [...(branch?.user1Ids || []), ...(branch?.user2Ids || [])]
      }
    });
    await putCreateLog(
      subdomain,
      {
        type: "tour",
        newData: doc,
        object: tour
      },
      user
    );
    return tour;
  },

  bmTourEdit: async (
    _root,
    { _id, ...doc },
    { models, user, subdomain }: IContext
  ) => {
    const tour = await models.Tours.getTour(_id);

    const updated = await models.Tours.updateTour(_id, doc as any);
    const branch = await models.BmsBranch.findById(tour.branchId);

    await sendMessage({
      serviceName: "notifications",
      subdomain,
      action: "send",
      data: {
        notifType: `touredit`,
        title: "Тур засав",
        content: `${tour.name} тур засав,хэрэглэгч ${user.details?.firstName || user.email || "."}`,
        action: `Reminder:`,
        link: `${tour._id}`,
        createdUser: user,
        // exclude current user
        contentType: "bm:tour",
        contentTypeId: tour._id,
        receivers: [...(branch?.user1Ids || []), ...(branch?.user2Ids || [])]
      }
    });
    await putUpdateLog(
      subdomain,
      {
        type: "tour",
        object: tour,
        newData: doc,
        updatedDocument: updated
      },
      user
    );
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
    const branchIds = tours.map((x) => x.branchId);
    const branchs = await models.BmsBranch.find({ _id: { $in: branchIds } });
    const names = tours.map((x) => x.name).join(",");
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
        content: `${names} турууд устлаа,хэрэглэгч ${user.details?.firstName || user.email || "."}`,
        action: `Reminder:`,
        link: `/tour`,
        createdUser: user,
        // exclude current user
        contentType: "bm:tour",
        contentTypeId: "deleteall",
        receivers: allUsers || []
      }
    });
    for (const tour of tours) {
      await putDeleteLog(subdomain, { type: "tour", object: tour }, user);
    }

    return ids;
  }
};

export default tourMutations;
