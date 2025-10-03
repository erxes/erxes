export type IAutomationBot = {
  pluginName: string;
  moduleName: string;
  name: string;
  label: string;
  description: string;
  logo: string;
  totalCountQueryName: string;
};

export type IAutomationBotsConstantsQueryResponse = {
  automationBotsConstants: IAutomationBot[];
};
