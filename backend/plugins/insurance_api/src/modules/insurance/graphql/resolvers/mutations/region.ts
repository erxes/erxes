import { IContext } from '~/connectionResolvers';

export const regionMutations = {
  createInsuranceRegion: Object.assign(
    async (
      _parent: undefined,
      { name, countries }: { name: string; countries: string[] },
      { models }: IContext,
    ) => {
      // Remove these countries from any existing region
      await models.Region.updateMany(
        { countries: { $in: countries } },
        { $pull: { countries: { $in: countries } } },
      );

      return models.Region.create({ name, countries });
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  updateInsuranceRegion: Object.assign(
    async (
      _parent: undefined,
      {
        id,
        name,
        countries,
      }: { id: string; name?: string; countries?: string[] },
      { models }: IContext,
    ) => {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (countries !== undefined) {
        // Remove these countries from other regions
        await models.Region.updateMany(
          { _id: { $ne: id }, countries: { $in: countries } },
          { $pull: { countries: { $in: countries } } },
        );
        updateData.countries = countries;
      }

      return models.Region.findByIdAndUpdate(id, updateData, { new: true });
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  deleteInsuranceRegion: Object.assign(
    async (
      _parent: undefined,
      { id }: { id: string },
      { models }: IContext,
    ) => {
      await models.Region.findByIdAndDelete(id);
      return true;
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  addCountryToRegion: Object.assign(
    async (
      _parent: undefined,
      { regionId, country }: { regionId: string; country: string },
      { models }: IContext,
    ) => {
      // Remove from any existing region first
      await models.Region.updateMany(
        { countries: country },
        { $pull: { countries: country } },
      );

      return models.Region.findByIdAndUpdate(
        regionId,
        { $addToSet: { countries: country } },
        { new: true },
      );
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  removeCountryFromRegion: Object.assign(
    async (
      _parent: undefined,
      { regionId, country }: { regionId: string; country: string },
      { models }: IContext,
    ) => {
      return models.Region.findByIdAndUpdate(
        regionId,
        { $pull: { countries: country } },
        { new: true },
      );
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
