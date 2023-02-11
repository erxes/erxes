import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';
import {
  IBuilding,
  IBuildingEdit
} from '../../../models/definitions/buildings';
import { findCenter } from '../utils';

const mutations = {
  buildingsAdd: async (_root, doc: IBuilding, { models }: IContext) => {
    return models.Buildings.createBuilding(doc);
  },

  buildingsEdit: async (_root, doc: IBuildingEdit, { models }: IContext) => {
    const { _id } = doc;
    return models.Buildings.updateBuilding(_id, doc);
  },

  buildingsRemove: (_root, { _ids }, { models }: IContext) => {
    return models.Buildings.deleteMany({ _id: { $in: _ids } });
  },

  buildingsUpdate: async (
    _root,
    { _id, customerIds, companyIds, assetIds },
    { models }: IContext
  ) => {
    const building = await models.Buildings.getBuilding({ _id });

    let contactType;
    let contactFieldId;
    let contactIds;

    if (customerIds) {
      contactType = 'customer';
      contactFieldId = 'contactId';
      contactIds = customerIds;
    }

    if (companyIds) {
      contactType = 'company';
      contactFieldId = 'contactId';
      contactIds = companyIds;
    }

    if (contactType) {
      const existingIds = await models.BuildingToContacts.find({
        buildingId: building._id,
        contactType
      }).distinct(contactFieldId);

      const newIds = contactIds.filter(id => !existingIds.includes(id));
      const removedIds = existingIds.filter(id => !contactIds.includes(id));

      await models.BuildingToContacts.deleteMany({
        buildingId: building._id,
        contactId: { $in: removedIds },
        contactType
      });

      const buildingToContact = newIds.map(id => ({
        buildingId: building._id,
        contactId: id,
        contactType
      }));

      await models.BuildingToContacts.insertMany(buildingToContact);
    }

    if (assetIds) {
      await models.Buildings.update({ _id }, { $set: { assetIds } });
    }

    return models.Buildings.getBuilding({ _id });
  },

  buildingsRemoveCustomers: async (
    _root,
    { _id, customerIds },
    { models }: IContext
  ) => {
    const building = await models.Buildings.getBuilding({ _id });

    await models.BuildingToContacts.deleteMany({
      buildingId: building._id,
      contactId: { $in: customerIds },
      contactType: 'customer'
    });

    return models.Buildings.getBuilding({ _id });
  },

  buildingsRemoveCompanies: async (
    _root,
    { _id, companyIds },
    { models }: IContext
  ) => {
    const building = await models.Buildings.getBuilding({ _id });

    await models.BuildingToContacts.deleteMany({
      buildingId: building._id,
      contactId: { $in: companyIds },
      contactType: 'company'
    });

    return models.Buildings.getBuilding({ _id });
  },

  buildingsSubmitServiceRequest: async (
    _root,
    { _id, buildingData, ticketData, quarterId },
    { models, subdomain, cpUser }: IContext
  ) => {
    const user = await sendCommonMessage({
      serviceName: 'clientportal',
      subdomain: subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        _id: cpUser.userId
      },
      isRPC: true,
      defaultValue: undefined
    });

    if (!user) {
      throw new Error('login required');
    }

    // const user = { erxesCustomerId: 'hTqM74dJPreqy4K5t' };

    let building = await models.Buildings.findOne({
      $or: [{ _id }, { osmbId: buildingData.id }]
    });

    if (!building) {
      const { min, max } = buildingData.properties.bounds;

      const bounds = [
        { lat: min[1], lng: min[0] },
        { lat: max[1], lng: max[0] }
      ];

      const location = findCenter(bounds);

      building = await models.Buildings.create({
        osmbId: buildingData.id,
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        },
        serviceStatus: 'inactive',
        name: buildingData.properties.name,
        quarterId
      });
    }

    const ticket = await sendCommonMessage({
      serviceName: 'cards',
      subdomain: subdomain,
      action: 'tickets.create',
      data: {
        ...ticketData,
        createdAt: new Date(),
        name: `Сүлжээ тавиулах хүсэлт: ${building.name}`,
        customerId: user.erxesCustomerId
      },
      isRPC: true,
      defaultValue: undefined
    });

    if (!ticket) {
      throw new Error('Ticket creation failed');
    }

    building.installationRequestIds.push(ticket._id);

    await building.save();

    await models.BuildingToContacts.createDoc({
      buildingId: building._id,
      contactId: user.erxesCustomerId,
      contactType: 'customer'
    });

    return building;
  }
};

export default mutations;
