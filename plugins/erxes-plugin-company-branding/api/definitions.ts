
export const companyBrandingSchema = {
  _id: { pkey: true },
  loginPageLogo:{type: String, optional: true, label: 'Login page logo' },
  mainIcon:{type: String, optional: true, label: 'Main icon' },
  favicon:{type: String, optional: true, label: 'favicon' },
  textColor: { type: String, optional: true, label: 'Text color' },
  backgroundColor: { type: String, optional: true, label: 'Background Color' },
  pageDesc: { type: String, optional: true, label: 'Login page description' },
  url: { type: String, optional: true, label: 'Redirect to home url', index: true },
};
