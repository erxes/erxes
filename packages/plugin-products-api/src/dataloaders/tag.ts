import * as DataLoader from "dataloader";
import * as _ from "underscore";
import { sendCoreMessage } from "../messageBroker";

export default function generateDataLoaderTag(subdomain) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result: any[] = await sendCoreMessage({
      subdomain,
      action: "tagFind",
      data: {
        _id: { $in: ids }
      },
      isRPC: true
    });

    const resultById = _.indexBy(result, "_id");
    return ids.map(id => resultById[id]);
  });
}
