import WithPermission from 'modules/common/components/WithPermission';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { pluginsOfSettings, pluginsSettingsNavigations } from 'pluginUtils';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  BoxName,
  MenusContainer,
  Row,
  RowTitle,
  Divider
} from '../styles';

const breadcrumb = [{ title: __('Settings'), link: '/settings' }];
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
      <Box className={type && 'hasBorder'}>
        <Link to={to}>
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
      <WithPermission action={action} actions={permissions}>
        {box}
      </WithPermission>
    );
  }

  render() {
    const content = (
      <MenusContainer id={'SettingsMain'}>
        <Row>
          <RowTitle>
            {__('General Settings')}
            <span>{__('Set up your basic settings')}</span>
          </RowTitle>
          <div id={'SettingsGeneralSettings'}>
            {this.renderBox(
              'System Configuration',
              '/images/icons/erxes-16.svg',
              '/settings/general',
              'generalSettingsAll',
              ['manageGeneralSettings', 'showGeneralSettings']
            )}
            {this.renderBox(
              'Brands',
              '/images/icons/erxes-03.svg',
              '/settings/brands',
              'brandsAll',
              ['showBrands', 'manageBrands']
            )}
            {this.renderBox(
              'Properties',
              '/images/icons/erxes-01.svg',
              '/settings/properties',
              ''
            )}
            {this.renderBox(
              'Import & Export',
              '/images/icons/erxes-22.svg',
              '/settings/importHistories',
              'importHistoriesAll',
              ['importHistories', 'removeImportHistories', 'importXlsFile']
            )}
          </div>
        </Row>
        <Divider />
        <Row>
          <RowTitle>
            {__('Plugin Settings')}
            <span>{__('Plugins settings')}</span>
          </RowTitle>
          <div id={'PluginSettings'}>
            {pluginsOfSettings(this.renderBox)}
            {pluginsSettingsNavigations().map((menu, index) => (
              <Box key={index}>
                <Link to={menu.props.to}>
                  {menu.type && <em>{menu.props.type}</em>}
                  <img src={menu.props.image} alt={menu.props.text} />
                  <BoxName>{__(menu.props.text)}</BoxName>
                </Link>
              </Box>
            ))}
          </div>
        </Row>
      </MenusContainer>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Settings')} breadcrumb={breadcrumb} />
        }
        content={content}
        transparent={true}
      />
    );
  }
}

export default Settings;
