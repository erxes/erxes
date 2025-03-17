import { IContext } from "../../connectionResolver";
import { sendCoreMessage } from "../../messageBroker";
import { IClassesDocument } from "../../models/definitions/classes";

const classes = {
  async students(classes: IClassesDocument, {}, { models, subdomain }) {
    const customerIds = await sendCoreMessage({
      subdomain,
      action: "conformities.savedConformity",
      data: {
        mainType: "classes",
        mainTypeId: classes._id.toString(),
        relTypes: ["customer"],
      },
      isRPC: true,
      defaultValue: [],
    });

    return await sendCoreMessage({
      subdomain,
      action: "customers.find",
      data: { _id: customerIds },
      isRPC: true,
    });
  },
};

export default classes;
