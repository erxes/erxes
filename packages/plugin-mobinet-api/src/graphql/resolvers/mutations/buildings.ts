import { IContext } from '../../../connectionResolver';
import {
  IBuilding,
  IBuildingEdit
} from '../../../models/definitions/buildings';

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

  buildingsAddCustomers: async (
    _root,
    { _id, customerIds },
    { models }: IContext
  ) => {
    const building = await models.Buildings.getBuilding({ _id });

    const buildingToContact = customerIds.map(customerId => ({
      buildingId: building._id,
      contactId: customerId,
      contactType: 'customer'
    }));

    await models.BuildingToContacts.insertMany(buildingToContact);

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

  buildingsAddCompanies: async (
    _root,
    { _id, companyIds },
    { models }: IContext
  ) => {
    const building = await models.Buildings.getBuilding({ _id });

    const buildingToContact = companyIds.map(companyId => ({
      buildingId: building._id,
      contactId: companyId,
      contactType: 'company'
    }));

    await models.BuildingToContacts.insertMany(buildingToContact);

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
  }
};

export default mutations;
