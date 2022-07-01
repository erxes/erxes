import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import Wrapper from './Wrapper';
import RightSidebar from './RightSidebar';
import { Alert } from 'modules/common/utils';
import { Tabs } from './tabs/index';
import { TabTitle } from './tabs/index';
import { Flex } from '@erxes/ui/src/styles/main';
import { ListHeader } from '../../styles';
import {
  DetailMainContainer,
  PluginTitle,
  Center,
  Carousel,
  DetailInformation,
  Hashtag,
  Detail,
  ColorHeader
} from '../../styles';

type Props = {
  id: string;
  enabledServicesQuery;
  manageInstall;
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
      plugin: {},
      loading: {}
    };
  }

  async componentDidMount() {
    await fetch(`https://erxes.io/pluginDetail/${this.props.id}`)
      .then(async response => {
        const plugin = await response.json();

        this.setState({ plugin });
      })
      .catch(e => {
        console.log(e);
      });

    // console.log("hiiiiiii", this.state.plugin);
  }

  render() {
    const { enabledServicesQuery } = this.props;
    const { loading, plugin } = this.state;

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

    const tabContent = this.state.tabType === 'Description' && (
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
          {([] as any).map(feature => (
            <>
              <b>{feature.name}</b>
              <p>{feature.text}</p>
              <ul>
                {feature.list.map(listItem => (
                  <li>{listItem}</li>
                ))}
              </ul>
            </>
          ))}
        </Detail>
      </>
    );

    const handleSelect = tab => {
      this.setState({ tabType: tab });
    };

    console.log(plugin, 'jjjjj');

    const content = (
      <DetailMainContainer>
        <PluginTitle>
          <Center>
            <img src={plugin.image} />
            <DetailInformation>
              <b>{plugin.title}</b>
              <Flex>
                {[].map(category => (
                  <Hashtag>
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

        <Carousel />

        <Tabs>
          <TabTitle
            onClick={() => handleSelect('Description')}
            active={this.state.tabType === 'Description'}
          >
            Description
          </TabTitle>
          <TabTitle
            onClick={() => handleSelect('Guide')}
            active={this.state.tabType === 'Guide'}
          >
            Guide
          </TabTitle>
          <TabTitle
            onClick={() => handleSelect('Changelog')}
            active={this.state.tabType === 'Changelog'}
          >
            Changelog
          </TabTitle>
        </Tabs>

        {tabContent}
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
