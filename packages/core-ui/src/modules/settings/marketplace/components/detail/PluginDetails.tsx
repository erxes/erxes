import {
  AdditionalDesc,
  AttachmentContainer,
  Center,
  ColorHeader,
  Detail,
  DetailInformation,
  DetailMainContainer,
  DetailStyle,
  Hashtag,
  PluginTitle
} from '../../styles';
import { Attachment, TabTitle, Tabs } from '@erxes/ui/src/components';

import { Alert } from 'modules/common/utils';
import { Flex } from '@erxes/ui/src/styles/main';
import { ListHeader } from '../../styles';
import React from 'react';
import RightSidebar from './RightSidebar';
import Wrapper from './Wrapper';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  id: string;
  enabledServicesQuery: any;
  manageInstall: any;
  plugin: any;
  plugins: any[];
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
      plugin: props.plugin || {},
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
                <b>✨ BENEFITS</b>
              </ColorHeader>
            </ListHeader>
            <AdditionalDesc
              dangerouslySetInnerHTML={{ __html: plugin.features }}
            />
          </Detail>
        </>
      );
    }

    if (tabType === 'Guide') {
      return (
        <>
          <DetailStyle dangerouslySetInnerHTML={{ __html: plugin.tango }} />
        </>
      );
    }

    return null;
  };

  renderCategories() {
    const categories = this.state.plugin.categories || [];

    if (categories.length === 0) {
      return <Hashtag>#Free</Hashtag>;
    }

    return categories.map((category, index) => (
      <Hashtag key={index}>
        {'#'}
        {category}
      </Hashtag>
    ));
  }

  renderScreenshots() {
    const { screenShots } = this.state.plugin;
    const items = screenShots.split(',');

    if (!items || items.length === 0) {
      return null;
    }

    return items.map((item, index) => {
      const attachment = {
        name: item,
        type: 'image',
        url: item
      };

      return <Attachment key={index} simple={true} attachment={attachment} />;
    });
  }

  render() {
    const { enabledServicesQuery, plugins } = this.props;
    const { loading, plugin, tabType } = this.state;

    const breadcrumb = [
      { title: __('Marketplace'), link: '/settings/installer' },
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
            <img
              src={plugin.avatar || plugin.image || '/images/no-plugin.png'}
            />
            <DetailInformation>
              <b>{plugin.title}</b>
              <Flex>{this.renderCategories()}</Flex>
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

        <AttachmentContainer>{this.renderScreenshots()}</AttachmentContainer>

        <div className="plugin-detail-tabs">
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
          </Tabs>

          <div className="plugin-detail-content">{this.renderContent()}</div>
        </div>
      </DetailMainContainer>
    );

    return (
      <Wrapper
        mainHead={
          <Wrapper.Header title={plugin.title} breadcrumb={breadcrumb} />
        }
        rightSidebar={<RightSidebar plugin={plugin} plugins={plugins} />}
        content={content}
      />
    );
  }
}

export default PluginDetails;
