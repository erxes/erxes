import { IContext } from '../../connectionResolver';
import { IBuildingDocument } from './../../models/definitions/buildings';

const Building = {
  async quarter(
    building: IBuildingDocument,
    _params,
    { models: { Quarters } }: IContext
  ) {
    return Quarters.findOne({
      _id: building.quarterId,
    }).lean();
  },

  async location(building, _params, _context) {
    return {
      lat: building.location.coordinates[1],
      lng: building.location.coordinates[0],
    };
  },

  async color(building, _params, _context) {
    switch (building.serviceStatus) {
      case 'active':
        return '#006400';
      case 'inprogress':
        return '#ffff00';
      default:
        return '#ff0000';
    }
  },

  async customers(building: IBuildingDocument, _args, { models }: IContext) {
    const customerIds = await models.BuildingToContacts.find({
      buildingId: building._id,
      contactType: 'customer',
    }).distinct('contactId');

    return customerIds.map((customerId) => ({
      _id: customerId,
      __typename: 'Customer',
    }));
  },

  async customersCount(building: IBuildingDocument, _args, { models }: IContext) {
    return models.BuildingToContacts.countDocuments({
      buildingId: building._id,
      contactType: 'customer',
    });
  },

  async companies(building: IBuildingDocument, _args, { models }: IContext) {
    const companyIds = await models.BuildingToContacts.find({
      buildingId: building._id,
      contactType: 'company',
    }).distinct('contactId');

    return companyIds.map((companyId) => ({
      _id: companyId,
      __typename: 'Company',
    }));
  },

  async companiesCount(building: IBuildingDocument, _args, { models }: IContext) {
    return models.BuildingToContacts.countDocuments({
      buildingId: building._id,
      contactType: 'company',
    });
  }
};

export { Building };
