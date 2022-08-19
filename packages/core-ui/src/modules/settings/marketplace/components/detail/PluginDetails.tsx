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
  DetailInformation,
  Hashtag,
  Detail,
  ColorHeader
} from '../../styles';
import Carousel from './Carousel';

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
      'https://wallpaperaccess.com/full/1760844.jpg',
      'https://wallpaperaccess.com/full/1282257.jpg',
      'https://wallpaperaccess.com/full/124624.jpg'
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
                {pluginCategories.map(category => (
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

        {dataSlider.length !== 0 && <Carousel dataSlider={dataSlider} />}

        <Tabs>
          <TabTitle
            onClick={() => handleSelect('Description')}
            active={tabType === 'Description'}
          >
            Description
          </TabTitle>
          <TabTitle
            onClick={() => handleSelect('Guide')}
            active={tabType === 'Guide'}
          >
            Guide
          </TabTitle>
          <TabTitle
            onClick={() => handleSelect('Changelog')}
            active={tabType === 'Changelog'}
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
