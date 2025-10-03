import { IContext } from "~/connectionResolvers";

const Brand = {
    __resolveReference: async ({ _id }, { models }: IContext) => {
      return models.Brands.findOne({ _id });
    },
};

export default { Brand };