import { FilterQuery } from "mongoose";
import { IContext } from "../../../connectionResolver";
import { ILabel } from "../../../db/models/definitions/labels";
import { DEFAULT_LABELS } from "../../constants";

interface ICustomLabel extends ILabel {
  type: string;
}

const labelQueries = {
  async labels(
    _root: undefined,
    args: { forType: string; userId?: string },
    { models }: IContext
  ) {
    const { forType, userId } = args || {};

    const filter: FilterQuery<ILabel> = {
      forType,
    };

    if (userId) {
      filter.userId = userId;
    }

    const labels = await models.Labels.find(filter).lean();

    if (!labels || !DEFAULT_LABELS[forType]) {
      throw new Error(`Invalid label type: '${forType}'`);
    }

    const customLabels: ICustomLabel[] = [];

    for (const label of labels) {
      customLabels.push({
        name: label.name,
        forType: label.forType,
        type: "custom",
      });
    }

    return [...DEFAULT_LABELS[forType], ...customLabels];
  },
};

export default labelQueries;
