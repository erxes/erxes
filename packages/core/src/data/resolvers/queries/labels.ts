import { IContext } from "../../../connectionResolver";
import { DEFAULT_LABELS } from "../../constants";

const labelQueries = {
  async labels(_root: any, args: any, { models }: IContext) {
    const { forType, userId } = args || {};

    const filter: any = {
      forType,
    };

    if (userId) {
      filter.userId = userId;
    }

    const labels = await models.Labels.find(filter).lean();

    if (!labels || !DEFAULT_LABELS[forType]) {
      throw new Error("Wrong forType");
    }

    const customLabels: any[] = [];

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
