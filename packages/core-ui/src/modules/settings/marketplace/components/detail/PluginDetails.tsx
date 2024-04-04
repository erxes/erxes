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
import { ListHeader } from '../../styles';
import { PluginCategories } from '../styles';
import React from 'react';
import RightSidebar from './RightSidebar';
import Wrapper from './Wrapper';
import { __ } from '@erxes/ui/src/utils';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { queries } from '../../graphql';

type Props = {
  id: string;
  enabledServicesQuery: any;
  manageInstall: any;
  plugin: any;
  plugins: any[];
};

type State = {
  tabType: string;
  lastLogMessage: string;
  plugin: any;
  loading: any;
};

class PluginDetails extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const plugin = props.plugin || {};

    this.state = {
      tabType: 'Description',
      lastLogMessage: '',
      plugin,
      loading: {}
    };

    client
      .query({
        query: gql(queries.getInstallationStatus),
        fetchPolicy: 'network-only',
        variables: { name: plugin.osName }
      })
      .then(({ data: { configsGetInstallationStatus } }) => {
        plugin.status = configsGetInstallationStatus.status;

        this.setState({ plugin });
      });

    const querySubscription = client
      .watchQuery({
        query: gql(queries.getInstallationStatus),
        fetchPolicy: 'network-only',
        pollInterval: 3000,
        variables: { name: plugin.osName }
      })
      .subscribe({
        next: ({ data: { configsGetInstallationStatus } }) => {
          const installationType = localStorage.getItem(
            'currentInstallationType'
          );

          const { status, lastLogMessage } = configsGetInstallationStatus;

          if (lastLogMessage) {
            this.setState({ lastLogMessage });
          }

          if (
            (installationType === 'install' && status === 'installed') ||
            (installationType === 'uninstall' && status === 'notExisting')
          ) {
            querySubscription.unsubscribe();
            localStorage.setItem('currentInstallationType', '');
            Alert.success('Success');
            window.location.reload();
          }
        },
        error: e => {
          Alert.error(e.message);
        }
      });
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
    const { plugins } = this.props;
    const { loading, plugin, lastLogMessage, tabType } = this.state;

    const breadcrumb = [
      { title: __('Marketplace'), link: '/marketplace' },
      { title: plugin.title || '' }
    ];

    const manageInstall = (type: string, name: string) => {
      localStorage.setItem('currentInstallationType', type);

      this.setState({ loading: { [name]: true } });

      this.props
        .manageInstall({
          variables: { type, name }
        })
        .catch(error => {
          Alert.error(error.message);
          this.setState({ loading: { [name]: false } });
          localStorage.setItem('currentInstallationType', '');
        });
    };

    const handleSelect = tab => {
      this.setState({ tabType: tab });
    };

    const renderButton = () => {
      if (!plugin.title) {
        return null;
      }

      if (plugin.status === 'installed') {
        return (
          <div>
            <button
              onClick={manageInstall.bind(this, 'uninstall', plugin.osName)}
              className="uninstall"
            >
              {loading[plugin.osName]
                ? `Uninstalling ... ${
                    lastLogMessage ? `(${lastLogMessage})` : ''
                  }`
                : 'Uninstall'}
            </button>

            <div style={{ clear: 'both' }} />
          </div>
        );
      }

      return (
        <button
          onClick={manageInstall.bind(this, 'install', plugin.osName)}
          className="install"
        >
          {loading[plugin.osName] || plugin.status === 'installing'
            ? `Installing ... ${lastLogMessage ? `(${lastLogMessage})` : ''}`
            : 'Install'}
        </button>
      );
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
              <PluginCategories>{this.renderCategories()}</PluginCategories>
            </DetailInformation>
          </Center>
          {renderButton()}
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
