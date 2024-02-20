import { generateModels } from '../connectionResolver';

export const afterTicketRemove = async (subdomain, params) => {
  const models = await generateModels(subdomain);

  const { _id } = params;

  const buildingsWitchTicketds = await models.Buildings.find({
    tickedIds: _id,
  });

  for (const building of buildingsWitchTicketds) {
    await models.Buildings.updateOne(
      { _id: building._id },
      { $pull: { ticketIds: _id } },
    );
  }

  const buildingsWithInstallationRequests = await models.Buildings.find({
    installationRequestIds: _id,
  });

  for (const building of buildingsWithInstallationRequests) {
    await models.Buildings.updateOne(
      { _id: building._id },
      { $pull: { installationRequestIds: _id } },
    );
  }
};
