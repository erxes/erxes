import {
  AttachmentContainer,
  Center,
  ColorHeader,
  Detail,
  DetailInformation,
  DetailMainContainer,
  Hashtag,
  PluginTitle
} from '../../styles';

import { Alert } from 'modules/common/utils';
import { Attachment } from '@erxes/ui/src/components';
import { Flex } from '@erxes/ui/src/styles/main';
import { ListHeader } from '../../styles';
import React from 'react';
import RightSidebar from './RightSidebar';
import { TabTitle } from './tabs/index';
import { Tabs } from './tabs/index';
import Wrapper from './Wrapper';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  id: string;
  enabledServicesQuery: any;
  manageInstall: any;
  plugin: any;
};

type State = {
  tabType: string;
  plugin: any;
  loading: any;
};

class PluginDetails extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      tabType: 'Description',
      plugin: props.plugin,
      loading: {}
    };
  }

  renderContent = () => {
    const { plugin, tabType } = this.state;

    if (tabType === 'Description') {
      return (
        <>
          <span dangerouslySetInnerHTML={{ __html: plugin.shortDescription }} />
          <Detail>
            <ListHeader>
              <ColorHeader>
                <b>📝 DESCRIPTION</b>
              </ColorHeader>
            </ListHeader>
            <p dangerouslySetInnerHTML={{ __html: plugin.description }} />
          </Detail>
          <Detail>
            <ListHeader>
              <ColorHeader>
                <b>✨ FEATURES</b>
              </ColorHeader>
            </ListHeader>
            <p dangerouslySetInnerHTML={{ __html: plugin.features }} />
          </Detail>
        </>
      );
    } else if (tabType === 'Guide') {
      return <div dangerouslySetInnerHTML={{ __html: plugin.userGuide }} />;
    }
    return null;
  };

  render() {
    const { enabledServicesQuery } = this.props;
    const { loading, plugin, tabType } = this.state;

    // fake data
    const pluginCategories = 'Free Marketing'.split(' ');

    const dataSlider = [
      {
        url: 'https://wallpaperaccess.com/full/1760844.jpg',
        name: 'image-1',
        type: 'image'
      },
      {
        url: 'https://wallpaperaccess.com/full/1282257.jpg',
        name: 'image-2',
        type: 'image'
      }
    ];

    const breadcrumb = [
      { title: __('Store'), link: '/settings/installer' },
      { title: plugin.title || '' }
    ];

    const enabledServices = enabledServicesQuery.enabledServices || {};

    const manageInstall = (type: string, name: string) => {
      this.setState({ loading: { [name]: true } });

      this.props
        .manageInstall({
          variables: { type, name }
        })
        .then(() => {
          Alert.success('You successfully installed');
          window.location.reload();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const handleSelect = tab => {
      this.setState({ tabType: tab });
    };

    const content = (
      <DetailMainContainer>
        <PluginTitle>
          <Center>
            <img src={plugin.image} />
            <DetailInformation>
              <b>{plugin.title}</b>
              <Flex>
                {pluginCategories.map((category, index) => (
                  <Hashtag key={index}>
                    {'#'}
                    {category}
                  </Hashtag>
                ))}
              </Flex>
            </DetailInformation>
          </Center>
          {plugin.title && enabledServices[plugin.title.toLowerCase()] ? (
            <>
              <span>
                {plugin.title && loading[plugin.title.toLowerCase()]
                  ? 'Loading ...'
                  : ''}
              </span>
              <div>
                <button
                  onClick={manageInstall.bind(
                    this,
                    'uninstall',
                    plugin.title && plugin.title.toLowerCase()
                  )}
                  className="uninstall"
                >
                  Uninstall
                </button>

                <button
                  onClick={manageInstall.bind(
                    this,
                    'update',
                    plugin.title && plugin.title.toLowerCase()
                  )}
                  className="update"
                >
                  Update
                </button>

                <div style={{ clear: 'both' }} />
              </div>
            </>
          ) : (
            <button
              onClick={manageInstall.bind(
                this,
                'install',
                plugin.title && plugin.title.toLowerCase()
              )}
              className="install"
            >
              {plugin.title && loading[plugin.title.toLowerCase()]
                ? 'Loading ...'
                : 'Install'}
            </button>
          )}
        </PluginTitle>

        <AttachmentContainer>
          {dataSlider.length !== 0 &&
            dataSlider.map((data, index) =>
              data.type === 'video' ? (
                <video key={index} controls={true} loop={true}>
                  <source src={data.url} type="video/mp4" />
                  {__('Your browser does not support the video tag')}.
                </video>
              ) : (
                <Attachment key={index} simple={true} attachment={data} />
              )
            )}
        </AttachmentContainer>

        <Tabs>
          <TabTitle
            onClick={() => handleSelect('Description')}
            className={tabType === 'Description' ? 'active' : ''}
          >
            Description
          </TabTitle>
          <TabTitle
            onClick={() => handleSelect('Guide')}
            className={tabType === 'Guide' ? 'active' : ''}
          >
            Guide
          </TabTitle>
          <TabTitle
            onClick={() => handleSelect('Changelog')}
            className={tabType === 'Changelog' ? 'active' : ''}
          >
            Changelog
          </TabTitle>
        </Tabs>

        {this.renderContent()}
      </DetailMainContainer>
    );

    return (
      <Wrapper
        mainHead={<Wrapper.Header title="" breadcrumb={breadcrumb} />}
        rightSidebar={<RightSidebar plugin={plugin} />}
        content={content}
      />
    );
  }
}

export default PluginDetails;
