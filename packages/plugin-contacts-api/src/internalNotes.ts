import { generateModels } from "./connectionResolver";

export default {
  generateInternalNoteNotif: async ({ subdomain, data }) => {
    const { Customers, Companies } = await generateModels(subdomain);
    const { contentTypeId, notifDoc, type } = data;

    let model: any = Customers;
    let link = `/contacts/details/`;

    if (type === 'company') {
      model = Companies;
      link = `/companies/details/`;
    }

    const response = await model.findOne({ _id: contentTypeId });

    const name =
      type === 'customer'
        ? await Customers.getCustomerName(response)
        : await Companies.getCompanyName(response);

    notifDoc.notifType = `${type}Mention`;
    notifDoc.content = name;
    notifDoc.link = link + response._id;
    notifDoc.contentTypeId = response._id;
    notifDoc.contentType = `${type}`;

    return notifDoc;
  }
};