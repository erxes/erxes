import WithPermission from "modules/common/components/WithPermission";
import { __ } from "modules/common/utils";
import Wrapper from "modules/layout/components/Wrapper";
import { pluginsOfSettings, pluginsSettingsNavigations } from "pluginUtils";
import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  BoxName,
  MenusContainer,
  Row,
  RowTitle,
  Divider,
} from "@erxes/ui-settings/src/main/styles";

const breadcrumb = [{ title: __("Settings"), link: "/settings" }];
const permissionActions = [
  "managePermissions",
  "showPermissions",
  "showPermissionModules",
  "showPermissionActions",
  "exportPermissions",
];
const teamPermissions = [
  "showUsers",
  "usersEdit",
  "usersInvite",
  "usersSetActiveStatus",
  "exportUsers",
];

class Settings extends React.PureComponent {
  renderBox(
    name: string,
    image: string,
    to: string,
    action: string,
    permissions?: string[],
    type?: string
  ) {
    const box = (
      <Box className={type && "hasBorder"}>
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

  render() {
    const content = (
      <MenusContainer id={"SettingsMain"}>
        <Row>
          <RowTitle>
            {__("General Settings")}
            <span>{__("Set up your basic settings")}</span>
          </RowTitle>
          <div id={"SettingsGeneralSettings"}>
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
              "Status",
              "/images/icons/erxes-06.svg",
              "/settings/status",
              ""
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
            {this.renderBox(
              "Properties",
              "/images/icons/erxes-01.svg",
              "/settings/properties",
              ""
            )}
            {this.renderBox(
              "Import & Export",
              "/images/icons/erxes-22.svg",
              "/settings/importHistories",
              "importHistoriesAll",
              ["importHistories", "removeImportHistories", "importXlsFile"]
            )}
          </div>
        </Row>
        <Divider />
        <Row>
          <RowTitle>
            {__("Plugin Settings")}
            <span>{__("Set up your additional plugin settings")}</span>
          </RowTitle>
          <div id={"PluginSettings"}>
            {pluginsSettingsNavigations().map((menu, index) => (
              <React.Fragment key={index}>
                {this.renderSettingsofPlugins(menu)}
              </React.Fragment>
            ))}
            {pluginsOfSettings(this.renderBox)}
          </div>
        </Row>
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
