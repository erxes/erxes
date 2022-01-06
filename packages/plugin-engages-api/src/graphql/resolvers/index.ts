import { GraphQLResolverMap } from "apollo-graphql";
import { EngageMessages } from "../../db/models";
import { IEngageMessageDocument } from "../../types";
import { DeliveryReports, Logs, Stats } from "../../models";
import { prepareSmsStats } from "../../telnyxUtils";
import Mutation from "./Mutation";
import Query from "./Query";

const DeliveryReport = {
  __resolveReference({ _id }) {
    return DeliveryReports.findOne({ _id })
  },
  engage(root) {
    return EngageMessages.findOne(
      { _id: root.engageMessageId },
      { title: 1 }
    ).lean();
  },
};

const EngageMessage = {
  __resolveReference({_id}) {
    return EngageMessages.findOne({ _id });
  },
  async segments(engageMessage: IEngageMessageDocument) {
    return (engageMessage.segmentIds || []).map((segmentId) => ({
      __typename: "Segment",
      _id: segmentId,
    }));
  },

  brands(engageMessage: IEngageMessageDocument) {
    return (engageMessage.brandIds || []).map((brandId) => ({
      __typename: "Brand",
      _id: brandId,
    }));
  },

  async customerTags(engageMessage: IEngageMessageDocument) {
    return (engageMessage.customerTagIds || []).map((customerTagId) => ({
      __typename: "Tag",
      _id: customerTagId,
    }));
  },

  fromUser(engageMessage: IEngageMessageDocument) {
    return { __typename: "User", _id: engageMessage.fromUserId };
  },

  // common tags
  async getTags(engageMessage: IEngageMessageDocument) {
    return (engageMessage.tagIds || []).map((tagId) => ({
      __typename: "Tag",
      _id: tagId,
    }));
  },

  brand(engageMessage: IEngageMessageDocument) {
    const { messenger } = engageMessage;
    if (messenger && messenger.brandId) {
      return { __typename: "Brand", _id: messenger.brandId };
    }
  },

  stats(engageMessage: IEngageMessageDocument) {
    return Stats.findOne({ engageMessageId: engageMessage._id });
  },

  logs(engageMessage: IEngageMessageDocument) {
    return Logs.find({
      engageMessageId: engageMessage._id,
    });
  },

  smsStats(
    engageMessage: IEngageMessageDocument
  ) {
    return prepareSmsStats(engageMessage._id);
  },

  fromIntegration(engageMessage: IEngageMessageDocument) {
    if (
      engageMessage.shortMessage &&
      engageMessage.shortMessage.fromIntegrationId
    ) {
      return {
        __typename: "Integration",
        _id: engageMessage.shortMessage.fromIntegrationId,
      };
    }

    return null;
  },

  async createdUser(engageMessage: IEngageMessageDocument) {
    /**
     * TODO:
     * do the `user.username || user.email || user._id` on the UI
     */

    return { __typename: "User", _id: engageMessage.createdBy }

    // this resolver used to be like below
    // const user = await getDocument("users", { _id: engageMessage.createdBy });

    // if (!user) {
    //   return "";
    // }

    // return user.username || user.email || user._id;
  },
};

const resolvers: GraphQLResolverMap = {
  DeliveryReport,
  EngageMessage,
  Mutation,
  Query,
};

export default resolvers;
