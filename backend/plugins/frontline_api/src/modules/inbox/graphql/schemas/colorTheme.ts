export const queries = `
  getColorThemePreview(theme: ColorThemeInput!): ColorThemePreview
`;

export const mutations = `
  applyColorThemeToIntegration(
    integrationId: String!,
    colorTheme: ColorThemeInput!
  ): Integration
`;
