import { IContext } from "../../../connectionResolver";
import {
  sendPurchasesMessage,
  sendSalesMessage,
  sendTasksMessage,
  sendTicketsMessage
} from "../../../messageBroker";
import {
  IConformityAdd,
  IConformityEdit
} from "../../../db/models/definitions/conformities";

const conformityMutations = {
  /**
   * Create new conformity
   */
  async conformityAdd(_root, doc: IConformityAdd, { models }: IContext) {
    return models.Conformities.addConformity({ ...doc });
  },

  /**
   * Edit conformity
   */
  async conformityEdit(
    _root,
    doc: IConformityEdit,
    { subdomain, models }: IContext
  ) {
    const { addedTypeIds, removedTypeIds } =
      await models.Conformities.editConformity({
        ...doc
      });

    switch (doc.mainType || doc.relType) {
      case "deal":
        await sendSalesMessage({
          subdomain,
          action: "publishHelperItems",
          data: {
            addedTypeIds,
            removedTypeIds,
            doc
          }
        });
      case "ticket":
        await sendTicketsMessage({
          subdomain,
          action: "publishHelperItems",
          data: {
            addedTypeIds,
            removedTypeIds,
            doc
          }
        });

      case "task":
        await sendTasksMessage({
          subdomain,
          action: "publishHelperItems",
          data: {
            addedTypeIds,
            removedTypeIds,
            doc
          }
        });

      case "purchase":
        await sendPurchasesMessage({
          subdomain,
          action: "publishHelperItems",
          data: {
            addedTypeIds,
            removedTypeIds,
            doc
          }
        });

        break;
    }
  }
};

export default conformityMutations;
