export interface IPipelineTemplateStage {
  name: string;
  formId: string;
  order?: number;
}

export interface IPipelineTemplate {
  _id: string;
  name: string;
  description: string;
  type: string;
  stages: IPipelineTemplateStage[];
}
