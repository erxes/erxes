import { IContext } from '../../../connectionResolver';
import { IPackage } from '../../../models/definitions/packages';

interface IPackageEdit extends IPackage {
  _id: string;
}

const saasMutations = {
  /**
   * Creates a new package
   */
  async packagesAdd(_root, doc: IPackage, { models }: IContext) {
    const packages = await models.Packages.createPackage(doc);

    return packages;
  },
};

export default saasMutations;
