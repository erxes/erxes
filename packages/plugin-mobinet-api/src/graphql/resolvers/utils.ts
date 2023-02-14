import { sendCommonMessage } from '../../messageBroker';

export const findCenter = coordinates => {
  let lat = 0;
  let lng = 0;

  if (coordinates.length === 1) {
    return { lat: coordinates[0].lat, lng: coordinates[0].lng };
  }

  for (let i = 0; i < coordinates.length; ++i) {
    lat += coordinates[i].lat;
    lng += coordinates[i].lng;
  }

  lat /= coordinates.length;
  lng /= coordinates.length;

  return { lat: lat, lng: lng };
};

export const extractCustomFields = async ({ subdomain, ticket }) => {
  let buildingId;
  let customerId;
  let productIds;
  let documentId;

  const cd = (ticket || {}).customFieldsData || [];

  for (const item of cd) {
    const field = await sendCommonMessage({
      subdomain,
      serviceName: 'forms',
      isRPC: true,
      action: 'fields.findOne',
      data: { query: { _id: item.field } }
    });

    if (field.code === 'buildingId') {
      buildingId = item.value;
      continue;
    }

    if (field.code === 'customerId') {
      customerId = item.value;
      continue;
    }

    if (field.code === 'productIds') {
      productIds = item.value;
      continue;
    }

    if (field.code === 'documentId') {
      documentId = item.value;
      continue;
    }
  }

  return {
    buildingId,
    customerId,
    productIds,
    documentId
  };
};
