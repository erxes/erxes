
export const companyBrandingSchema = {
  _id: { pkey: true },
  textColor: { type: String, optional: true, label: 'Text color' },
  backgroundColor: { type: String, optional: true, label: 'Background Color' },
  pageDesc: { type: String, optional: true, label: 'Login page description' },
  url: { type: String, optional: true, label: 'Redirect to home url', index: true },
  email: { type: String, label: 'Email', optional: true, index: true },
  type: { type: String, label: 'Type', optional: true },
};
