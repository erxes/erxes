import { AppConsumer } from 'appContext';
import { __ } from 'modules/common/utils';
import { Divider, Row, RowTitle } from 'modules/settings/main/styles';
import React from 'react';
import { Route } from 'react-router-dom';

const tryRequire = (requirPath) => {
  try {
    return require(`${requirPath}`);
  } catch (err) {
    return {};
  }
};

export const pluginsRoutes = (currentUser) => {
  const pluginModules = tryRequire('./plugins').default || {};

  const plugins: any = [];
  const pluginRoutes: any = [];
  const specialPluginRoutes: any = [];

  for (const pluginName of Object.keys(pluginModules)) {
    const plugin = pluginModules[pluginName]();

    plugins.push({
      name: pluginName,
      ...plugin
    });

    if (plugin.response) {
      const Component = plugin.response;
      specialPluginRoutes.push(
        <Component key={Math.random()} currentUser={currentUser} />
      )
    }

    if (plugin.routes) {
      for (const route of plugin.routes) {
        const { component } = route;
        const path = `/${pluginName}${route.path}`

        pluginRoutes.push(
          <Route
            key={path}
            exact={true}
            path={path}
            component={component}
          />
        )
      }
    }
  }

  return { plugins, pluginRoutes, specialPluginRoutes }
}

export const navigations = (renderNavItem) => {
  return (
    <AppConsumer>
      {({ plugins }) => (
        <>
          {plugins.map(plugin => {
            const menu = plugin.menu;

            if (!menu) {
              return undefined
            }

            return (
              renderNavItem(
                menu.permission,
                menu.label,
                `/${plugin.name}${menu.link}`,
                menu.icon,
              )
            )
          })}
        </>
      )}
    </AppConsumer>
  )
}

const renderPlugins = (plugins, renderBox) => {
  let hasPluginsSettings = false;

  const pluginsBoxs = plugins.map(plugin => {
    const item = plugin.settings;

    if (!item) {
      return undefined;
    }

    hasPluginsSettings = true;
    const pluginSettings: JSX.Element[] = [];
    for (const perSettings of plugin.settings) {
      pluginSettings.push(
        <span key={Math.random()}>
          {
            renderBox(
              perSettings.name,
              perSettings.image,
              perSettings.to,
              perSettings.action,
              perSettings.permissions
            )
          }
        </span>
      )
    }
    return pluginSettings;
  })

  if (!hasPluginsSettings) {
    return undefined;
  }

  return (
    <>
      <Divider />
      <Row>
        <RowTitle>{__('Plugins Settings')}</RowTitle>
        <div id={'PluginsSettings'}>
          {pluginsBoxs}
        </div>
      </Row>
    </>
  );
}

export const settingsLayout = (renderBox) => {
  return (
    <AppConsumer>
      {({ plugins }) => (
        <>
          {renderPlugins(plugins, renderBox)}
        </>
      )}
    </AppConsumer>
  )
}

export const customerRightSidebar = (customer) => {
  return (
    <AppConsumer>
      {({ plugins }) => (
        plugins.map(plugin => {
          const rsSection = plugin.customerRightSidebarSection;

          if (!rsSection) {
            return undefined;
          }

          const Component = rsSection.section;
          return (<Component
            key={plugin.name}
            customerId={customer._id}
            mainType={'customer'}
            mainTypeId={customer._id}
          />)
        })
      )}
    </AppConsumer>
  )
}

export const companyRightSidebar = (company) => {
  return (
    <AppConsumer>
      {({ plugins }) => (
        plugins.map(plugin => {
          const rsSection = plugin.companyRightSidebarSection;

          if (!rsSection) {
            return undefined;
          }

          const Component = rsSection.section;
          return (<Component
            key={plugin.name}
            companyId={company._id}
            mainType={'company'}
            mainTypeId={company._id}
          />)
        })
      )}
    </AppConsumer>
  )
}

export const itemRightSidebar = (item) => {
  return (
    <AppConsumer>
      {({ plugins }) => (
        plugins.map(plugin => {
          const rsSection = plugin.dealRightSidebarSection;

          if (!rsSection) {
            return undefined;
          }

          const Component = rsSection.section;
          return (<Component
            key={plugin.name}
            itemId={item._id}
            mainType={'deal'}
            mainTypeId={item._id}
          />)
        })
      )}
    </AppConsumer>
  )
}

export const paymentForm = (renderPaymentsByType) => {
  return (
    <AppConsumer>
      {({ plugins }) => (
        plugins.map(plugin => {
            const item = plugin.payments;

            if (!item) {
              return undefined;
            }

            const paymentsTypes: JSX.Element[] = [];
            for (const perPayment of plugin.payments) {
              if (perPayment.component) {
                paymentsTypes.push(
                  perPayment.component({ ...perPayment })
                )
              } else {
                paymentsTypes.push(
                  renderPaymentsByType({ ...perPayment })
                )
              }
            }
            return paymentsTypes;
          })
      )}
    </AppConsumer>
  )
}
