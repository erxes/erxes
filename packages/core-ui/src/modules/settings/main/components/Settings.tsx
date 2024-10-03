import WithPermission from "modules/common/components/WithPermission";
import { __ } from "modules/common/utils";
import Wrapper from "modules/layout/components/Wrapper";
import { pluginsSettingsNavigations } from "pluginUtils";
import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  BoxName,
  MenusContainer,
  Row,
  RowTitle,
  Divider
} from "@erxes/ui-settings/src/main/styles";
import { getVersion } from "@erxes/ui/src/utils/core";

const breadcrumb = [{ title: __("Settings"), link: "/settings" }];
const permissionActions = [
  "managePermissions",
  "showPermissions",
  "showPermissionModules",
  "showPermissionActions",
  "exportPermissions"
];
const teamPermissions = [
  "showUsers",
  "usersEdit",
  "usersInvite",
  "usersSetActiveStatus",
  "exportUsers"
];

class Settings extends React.PureComponent {
  renderBox(
    name: string,
    image: string,
    to: string,
    action: string,
    permissions?: string[],
    type?: string,
    color?: string
  ) {
    const box = (
      <Box color={color}>
        <Link to={to || "#"}>
          {type && <em>{type}</em>}
          <img src={image} alt={name} />
          <BoxName>{__(name)}</BoxName>
        </Link>
      </Box>
    );

    if (!action) {
      return box;
    }

    return (
      <WithPermission key={to} action={action} actions={permissions}>
        {box}
      </WithPermission>
    );
  }

  renderSettingsofPlugins(menu) {
    const { to, type, text, image, action, permissions } = menu.props;

    return this.renderBox(text, image, to, action, permissions, type);
  }

  renderPluginSettings() {
    const plugins = pluginsSettingsNavigations(this.renderBox);

    if (plugins.length === 0) {
      return null;
    }
    return (
      <>
        <Divider />
        <Row>
          <RowTitle>
            {__("Plugin Settings")}
            <span>{__("Set up your additional plugin settings")}</span>
          </RowTitle>
          <div id={"PluginSettings"}>{plugins}</div>
        </Row>
      </>
    );
  }

  render() {
    const { VERSION } = getVersion();
    const content = (
      <MenusContainer id={"SettingsMain"}>
        <Row>
          <RowTitle>
            {__("General Settings")}
            <span>{__("Set up your basic settings")}</span>
          </RowTitle>
          <div id={"SettingsGeneralSettings"}>
            {VERSION && VERSION === "saas" ? (
              <>
                {this.renderBox(
                  "Organization settings",
                  "/images/icons/erxes-35.png",
                  "/settings/organizations",
                  "editOrganizationInfo"
                )}
                <Box>
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://erxes.io/organizations"
                  >
                    <img
                      src="/images/icons/erxes-24.svg"
                      alt="Global Account"
                    />
                    <BoxName>{__("Global Account Profile")}</BoxName>
                  </a>
                </Box>
              </>
            ) : null}

            {this.renderBox(
              "System Configuration",
              "/images/icons/erxes-16.svg",
              "/settings/general",
              "generalSettingsAll",
              ["manageGeneralSettings", "showGeneralSettings"]
            )}
            {this.renderBox(
              "Permissions",
              "/images/icons/erxes-02.svg",
              "/settings/permissions",
              "permissionsAll",
              permissionActions
            )}
            {this.renderBox(
              "Team Members",
              "/images/icons/erxes-23.svg",
              "/settings/team",
              "usersAll",
              teamPermissions
            )}
            {this.renderBox(
              "Brands",
              "/images/icons/erxes-03.svg",
              "/settings/brands",
              "brandsAll",
              ["showBrands", "manageBrands"]
            )}
            {/* {this.renderBox(
              "Properties",
              "/images/icons/erxes-01.svg",
              "/settings/properties",
              ""
            )} */}
            {this.renderBox(
              "Import & Export",
              "/images/icons/erxes-22.svg",
              "/settings/selectMenu",
              "importHistoriesAll",
              ["importHistories", "removeImportHistories", "importXlsFile"]
            )}
            {this.renderBox(
              "Apps",
              "/images/icons/erxes-20.svg",
              "/settings/apps",
              "",
              []
            )}
            {this.renderBox(
              "Structure",
              "/images/icons/erxes-15.svg",
              "/settings/structure",
              "usersAll",
              teamPermissions
            )}

            {this.renderBox(
              "Tags",
              "/images/icons/erxes-18.svg",
              "/settings/tags",
              "tagsAll",
              ["showTags", "manageTags"]
            )}

            {this.renderBox(
              "System Logs",
              "/images/icons/erxes-33.png",
              "/settings/logs",
              "",
              []
            )}

            {this.renderBox(
              "Properties",
              "/images/icons/erxes-01.svg",
              "/settings/properties",
              "formsAll",
              ["showForms", "manageForms"]
            )}

            {this.renderBox(
              "Email Delivery Logs",
              "/images/icons/erxes-27.png",
              "/settings/emailDelivery",
              "",
              []
            )}
            {this.renderBox(
              "Configs of Products",
              "/images/icons/erxes-07.svg",
              "/settings/uoms-manage",
              "",
              ["showProducts", "manageProducts"]
            )}

            {this.renderBox(
              "Product and services",
              "/images/icons/erxes-31.png",
              "/settings/product-service/",
              "",
              ["showProducts", "manageProducts"]
            )}

            {this.renderBox(
              "Email Templates",
              "/images/icons/erxes-09.svg",
              "/settings/email-templates",
              "emailTemplateAll",
              ["showEmailTemplates"]
            )}
          </div>
        </Row>
        {this.renderPluginSettings()}
      </MenusContainer>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__("Settings")} breadcrumb={breadcrumb} />
        }
        content={content}
        transparent={true}
      />
    );
  }
}

export default Settings;
