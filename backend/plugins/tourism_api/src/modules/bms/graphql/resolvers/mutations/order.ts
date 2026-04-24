import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { IOrderCreateInput } from '@/bms/@types/order';

const orderMutations: Record<string, Resolver<any, any, IContext>> = {
  bmsOrderAdd: async (
    _root,
    { order }: { order: IOrderCreateInput },
    { user, models }: IContext,
  ) => {
    return models.Orders.createOrder(order, user?._id);
  },

  bmsOrderEdit: async (
    _root,
    { _id, order }: { _id: string; order: any },
    { models }: IContext,
  ) => {
    return models.Orders.updateOrder(_id, order);
  },

  bmsOrderRemove: async (
    _root,
    { ids }: { ids: string[] },
    { models }: IContext,
  ) => {
    await models.Orders.removeOrder(ids);
    return ids;
  },

  bmsOrderRecordPayment: async (
    _root,
    { _id, payment }: { _id: string; payment: any },
    { user, models }: IContext,
  ) => {
    return models.Orders.recordPayment(_id, {
      ...payment,
      recordedBy: user?._id,
    });
  },

  cpBmsOrderAdd: async (
    _root,
    { order }: { order: IOrderCreateInput },
    { user, models }: IContext,
  ) => {
    return models.Orders.createOrder(order, user?._id);
  },

  cpBmsOrderEdit: async (
    _root,
    { _id, order }: { _id: string; order: any },
    { models }: IContext,
  ) => {
    return models.Orders.updateOrder(_id, order);
  },

  cpBmsOrderRemove: async (
    _root,
    { ids }: { ids: string[] },
    { models }: IContext,
  ) => {
    await models.Orders.removeOrder(ids);
    return ids;
  },
};

export default orderMutations;

orderMutations.cpBmsOrderAdd.wrapperConfig = {
  forClientPortal: true,
};
orderMutations.cpBmsOrderEdit.wrapperConfig = {
  forClientPortal: true,
};
orderMutations.cpBmsOrderRemove.wrapperConfig = {
  forClientPortal: true,
};
