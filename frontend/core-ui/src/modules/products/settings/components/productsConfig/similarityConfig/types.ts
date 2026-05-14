export interface ISimilarityRule {
  id: string;
  title: string;
  groupId: string;
  fieldId: string;
}

export interface ISimilarityGroupConfig {
  title: string;
  filterField: string;
  codeMask: string;
  defaultProduct: string;
  rules: ISimilarityRule[];
}

export interface ISimilarityGroupMap {
  [group: string]: ISimilarityGroupConfig;
}
