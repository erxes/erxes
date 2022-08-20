import { IContext } from '../../../connectionResolver';
import { INeighborDocument } from '../../../models/definitions/neighbor';

export default {
  async info(neighbor: INeighborDocument, {}, { models }: IContext) {
    var info = {};
    var temp = neighbor.data;
    if (
      !temp ||
      (!temp['kindergarden'] &&
        !neighbor.data['university'] &&
        !neighbor.data['school'] &&
        !neighbor.data['soh'] &&
        !neighbor.data['khoroo'] &&
        !neighbor.data['hospital'] &&
        !neighbor.data['parking'] &&
        !neighbor.data['pharmacy'] &&
        !neighbor.data['districtTown'])
    ) {
      return null;
    }
    if (neighbor.data) {
      if (neighbor.data['kindergarden'])
        info['kindergarden'] = await models.NeighborItem.find({
          _id: neighbor.data['kindergarden']
        });

      if (neighbor.data['university'])
        info['university'] = await models.NeighborItem.find({
          _id: neighbor.data['university']
        });
      if (neighbor.data['school'])
        info['school'] = await models.NeighborItem.find({
          _id: neighbor.data['school']
        });
      if (neighbor.data['soh'])
        info['soh'] = await models.NeighborItem.find({
          _id: neighbor.data['soh']
        });
      if (neighbor.data['khoroo'])
        info['khoroo'] = await models.NeighborItem.find({
          _id: neighbor.data['khoroo']
        });
      if (neighbor.data['hospital'])
        info['hospital'] = await models.NeighborItem.find({
          _id: neighbor.data['hospital']
        });
      if (neighbor.data['parking'])
        info['parking'] = await models.NeighborItem.find({
          _id: neighbor.data['parking']
        });
      if (neighbor.data['pharmacy'])
        info['pharmacy'] = await models.NeighborItem.find({
          _id: neighbor.data['pharmacy']
        });
      if (neighbor.data['districtTown'])
        info['districtTown'] = await models.NeighborItem.find({
          _id: neighbor.data['districtTown']
        });
    }

    return info;
  }
};
