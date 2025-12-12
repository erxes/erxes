export const Template = {
  _id: (template: any) => {
    return template._id ? template._id.toString() : null;
  },
  createdBy: (template: any) => {
    return template.createdBy || null;
  },
  updatedBy: (template: any) => {
    return template.updatedBy || null;
  },
};
