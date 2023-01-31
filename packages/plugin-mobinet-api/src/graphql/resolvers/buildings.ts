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

  async customersCount(
    building: IBuildingDocument,
    _args,
    { models }: IContext
  ) {
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

  async companiesCount(
    building: IBuildingDocument,
    _args,
    { models }: IContext
  ) {
    return models.BuildingToContacts.countDocuments({
      buildingId: building._id,
      contactType: 'company',
    });
  },

  async installationRequests(
    building: IBuildingDocument,
    _args,
    { models }: IContext
  ) {
    const installationRequestIds = building.installationRequestIds || [];

    return installationRequestIds.map((installationRequestId) => ({
      _id: installationRequestId,
      __typename: 'Ticket',
    }));
  },

  async tickets(building: IBuildingDocument, _args, { models }: IContext) {
    const ticketIds = building.ticketIds || [];

    return ticketIds.map((ticketId) => ({
      _id: ticketId,
      __typename: 'Ticket',
    }));
  },

  async suh(building: IBuildingDocument) {
    return {
      _id: building.suhId,
      __typename: 'Company',
    };
  },

  async productPriceConfigs(
    building: IBuildingDocument,
    _args,
    { models }: IContext
  ) {
    const productPriceConfigs = building.productPriceConfigs || [];

    return productPriceConfigs.map((productPriceConfig) => ({
      productId: productPriceConfig.productId,
      price: productPriceConfig.price,
      product: {
        _id: productPriceConfig.productId,
        __typename: 'Product',
      },
    }));
  },
};

export { Building };
