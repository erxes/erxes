const productsQueryParams = `
  productIds: [String]
  stageId: String
  pipelineId: String
`;

export const queries = `
  erkhetRemainders(
    ${productsQueryParams}
  ): [erkhetRemainder]  
`;
