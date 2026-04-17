export type ConsentClient = {
  id: string;
  name: string;
  description: string;
  logoText: string;
};

export type ConsentScope = {
  scope: string;
  description: string;
};

export type ConsentDetailsResponse = {
  client: ConsentClient;
  scopes: ConsentScope[];
};

export type ScopeLeaf = ConsentScope & {
  module: string;
  action: string;
};

export type ModuleGroup = {
  module: string;
  scopes: ScopeLeaf[];
};

export type ActionGroup = {
  action: string;
  title: string;
  modules: ModuleGroup[];
};
