declare var __webpack_init_sharing__;
declare var __webpack_share_scopes__;
declare var window;

import { AppConsumer, AppProvider } from "./appContext";
import { IUser } from "@erxes/ui/src/auth/types";
import { IItem } from "@erxes/ui-cards/src/boards/types";
import { __ } from "@erxes/ui/src/utils";
import { ICompany } from "@erxes/ui/src/companies/types";
import { ICustomer } from "@erxes/ui/src/customers/types";
import { Divider, Row, RowTitle } from "@erxes/ui-settings/src/main/styles";
import React from "react";
import { Route } from "react-router-dom";
import pluginModules from "./plugins";

interface ISubNav {
  permission: string;
  link: string;
  value: string;
  icon: string;
  additional?: boolean;
}

export const pluginsOfRoutes = (currentUser: IUser) => {
  const plugins: any = [];
  const pluginRoutes: any = [];
  const specialPluginRoutes: any = [];
  const properties: any = [];

  for (const pluginName of Object.keys(pluginModules)) {
    const plugin = pluginModules[pluginName]();

    plugins.push({
      name: pluginName,
      ...plugin,
    });

    if (plugin.response) {
      const Component = plugin.response;
      specialPluginRoutes.push(
        <Component key={Math.random()} currentUser={currentUser} />
      );
    }

    if (plugin.routes) {
      for (const route of plugin.routes) {
        const { component } = route;
        const path = `/${pluginName}${route.path}`;

        pluginRoutes.push(
          <Route key={path} exact={true} path={path} component={component} />
        );
      }
    }

    if (plugin.property) {
      properties.push(plugin.property);
    }
  }

  localStorage.setItem("plugins_properties", JSON.stringify(properties));

  return { plugins, pluginRoutes, specialPluginRoutes };
};

const PluginsWrapper = ({
  itemName,
  callBack,
  plugins
}: {
  itemName: string;
  callBack: (plugin: any, item: any) => React.ReactNode;
  plugins?: any[];
}) => {
  return (
    <AppProvider plugins={plugins}>
    <AppConsumer>
      {({ plugins }) =>
        (plugins || []).map((plugin) => {
          const item = plugin[itemName];

          if (!item) {
            return undefined;
          }

          return callBack(plugin, item);
        })
      }
    </AppConsumer>
    </AppProvider>
  );
};

export const pluginsOfNavigations = (
  renderNavItem: (
    permission: string,
    text: string,
    url: string,
    icon: string,
    childrens?: ISubNav[],
    label?: React.ReactNode
  ) => React.ReactNode
) => {
  return (
    <PluginsWrapper
      itemName={"menu"}
      callBack={(plugin, menu) => {
        return renderNavItem(
          menu.permission,
          menu.label,
          `/${plugin.name}${menu.link}`,
          menu.icon
        );
      }}
    />
  );
};

const renderSettings = (
  plugins: any[],
  renderBox: (
    name: string,
    image: string,
    to: string,
    action: string,
    permissions?: string[]
  ) => React.ReactNode
) => {
  let hasPluginsSettings = false;

  const pluginsBoxs = plugins.map((plugin) => {
    const item = plugin.settings;

    if (!item) {
      return undefined;
    }

    hasPluginsSettings = true;
    const pluginSettings: React.ReactNode[] = [];
    for (const perSettings of plugin.settings) {
      pluginSettings.push(
        <span key={Math.random()}>
          {renderBox(
            perSettings.name,
            perSettings.image,
            perSettings.to,
            perSettings.action,
            perSettings.permissions
          )}
        </span>
      );
    }
    return pluginSettings;
  });

  if (!hasPluginsSettings) {
    return undefined;
  }

  return (
    <>
      <Divider />
      <Row>
        <RowTitle>{__("Plugins Settings")}</RowTitle>
        <div id={"PluginsSettings"}>{pluginsBoxs}</div>
      </Row>
    </>
  );
};

export const pluginsOfSettings = (
  renderBox: (
    name: string,
    image: string,
    to: string,
    action: string,
    permissions?: string[]
  ) => React.ReactNode
) => {
  return (
    <AppConsumer>
      {({ plugins }) => <>{renderSettings(plugins, renderBox)}</>}
    </AppConsumer>
  );
};

export const loadComponent = (scope, module) => {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    await __webpack_init_sharing__("default");

    const container = window[scope]; // or get the container somewhere else

    // Initialize the container, it may provide shared modules
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(module);

    const Module = factory();
    return Module;
  };
};

const renderPlguginSidebar = (itemName: string, type: string, object: any) => {
  const plugins: any[] = (window as any).plugins || [];
  return (
    <PluginsWrapper
      itemName={itemName}
      plugins={plugins}
      callBack={(_plugin, section) => {
        const Component = React.lazy(loadComponent(section.scope, section.component));
        return (
          <Component
            key={Math.random()}
            companyId={object._id}
            mainType={type}
            mainTypeId={object._id}
          />
        );
      }}
    />
  );
};

export const pluginsOfCustomerSidebar = (customer: ICustomer) => {
  console.log("pluginsOfCustomerSidebar")
  return renderPlguginSidebar(
    "customerRightSidebarSection",
    "customer",
    customer
  );
};

export const pluginsOfCompanySidebar = (company: ICompany) => {
  return renderPlguginSidebar("companyRightSidebarSection", "company", company);
};

export const pluginsOfItemSidebar = (item: IItem, type: string) => {
  return renderPlguginSidebar(`${type}RightSidebarSection`, type, item);
};

export const pluginsOfPaymentForm = (
  renderPaymentsByType: (type) => JSX.Element
) => {
  return (
    <PluginsWrapper
      itemName={"payments"}
      callBack={(_plugin, payments) => {
        const paymentsTypes: JSX.Element[] = [];
        for (const perPayment of payments) {
          if (perPayment.component) {
            paymentsTypes.push(perPayment.component({ ...perPayment }));
          } else {
            paymentsTypes.push(renderPaymentsByType({ ...perPayment }));
          }
        }
        return paymentsTypes;
      }}
    />
  );
};

export const pluginsOfWebhooks = () => {
  let webhookActions: any = [];

  for (const pluginName of Object.keys(pluginModules)) {
    const plugin = pluginModules[pluginName]();

    if (plugin.webhookActions) {
      webhookActions = webhookActions.concat(plugin.webhookActions);
    }
  }

  return { webhookActions };
};
