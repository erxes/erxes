import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { mutations } from '@erxes/ui-settings/src/general/graphql';
import styled from 'styled-components';
import Wrapper from './Wrapper';
import PluginPreview from './PluginPreview';
import UserPreview from './UserPreview';
import Leftbar from './Leftbar';
import { colors, dimensions } from 'modules/common/styles';

// const Container = styled.div`
//   h3 {
//     color: rgb(103, 63, 189) !important;
//     margin-left: 10px;
//   }
// `;

const ImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${dimensions.coreSpacing}px;
  height: 250px;
  background-color: ${colors.colorPrimary};
  border-radius: 8px;
  position: relative;
  color: ${colors.colorWhite};
  font-weight: 700;
  font-size: 20px;
  background-image: url('/images/stars.png');
`;

const MarketplaceImage = styled.img`
  position: absolute;
  right: 0;
  bottom: 0;
`;

const Block = styled.div`
  width: 250px;
  float: left;
  border: 1px solid #cfc6c6;
  margin: 20px 10px;
  padding: 10px 20px;
  position: relative;

  button {
    float: left;
    margin-right: 5px;
    background: rgb(103, 63, 189);
    border-radius: 5px;
    color: rgb(255, 255, 255);
    border: none;
    font-weight: 500;
    outline: 0px;
    padding: 5px 15px;
    cursor: pointer;
  }

  .uninstall {
    background: #eb5a5a;
  }

  p {
    text-transform: capitalize;
    margin-bottom: 10px;
    font-weight: bold;

    i {
      color: rgb(103, 63, 189);
      font-weight: bold;
      font-size: 20px;
      margin-right: 3px;
    }
  }
`;

type FinalProps = {
  manageInstall;
  enabledServicesQuery;
};

class Installer extends React.Component<FinalProps, { loading: any }> {
  constructor(props) {
    super(props);

    this.state = {
      loading: {}
    };
  }

  renderContent() {
    return (
      <>
        <ImageWrapper>
          <span>Product Experience</span>
          <span>management template</span>
          <MarketplaceImage src="/images/marketplace.png" alt="installer" />
          {/* <img
            src="/images/stars.png"
            alt="stars"
          /> */}
        </ImageWrapper>
        <PluginPreview header="Plugins" />
        {/* <UserPreview header="Top user" /> */}
        {/* <PluginPreview header="New plugins" /> */}
      </>
    );
  }

  render() {
    // const { enabledServicesQuery } = this.props;
    // const { loading } = this.state;

    // const enabledServices = enabledServicesQuery.enabledServices || {};

    // const manageInstall = (type: string, name: string) => {
    //   this.setState({ loading: { [name]: true } });

    //   this.props
    //     .manageInstall({
    //       variables: { type, name }
    //     })
    //     .then(() => {
    //       Alert.success('You successfully installed');
    //       window.location.reload();
    //     })
    //     .catch(error => {
    //       Alert.error(error.message);
    //     });
    // };

    // const plugins = [
    //   { name: 'automations', icon: 'icon-circular' },
    //   { name: 'calendar', icon: 'icon-calendar-alt' },
    //   { name: 'cards', icon: 'icon-piggy-bank' },
    //   { name: 'cars', icon: 'icon-piggy-bank' },
    //   { name: 'chats', icon: 'icon-piggy-bank' },
    //   { name: 'clientportal', icon: 'icon-megaphone' },
    //   { name: 'contacts', icon: 'icon-users' },
    //   { name: 'dashboard', icon: 'icon-users' },
    //   { name: 'ebarimt', icon: 'icon-users' },
    //   { name: 'emailtemplates', icon: 'icon-users' },
    //   { name: 'engages', icon: 'icon-megaphone' },
    //   { name: 'exm', icon: 'icon-megaphone' },
    //   { name: 'exmfeed', icon: 'icon-megaphone' },
    //   { name: 'forms', icon: 'icon-book-open' },
    //   { name: 'inbox', icon: 'icon-chat' },
    //   { name: 'integrations', icon: 'icon-megaphone' },
    //   { name: 'internalnotes', icon: 'icon-megaphone' },
    //   { name: 'knowledgebase', icon: 'icon-book-open' },
    //   { name: 'loan', icon: 'icon-book-open' },
    //   { name: 'logs', icon: 'icon-book-open' },
    //   { name: 'loyalties', icon: 'icon-book-open' },
    //   { name: 'neighbor', icon: 'icon-book-open' },
    //   { name: 'notifications', icon: 'icon-megaphone' },
    //   { name: 'products', icon: 'icon-users' },
    //   { name: 'qpay', icon: 'icon-users' },
    //   { name: 'rentpay', icon: 'icon-users' },
    //   { name: 'segments', icon: 'icon-chart-pie-alt' },
    //   { name: 'syncerkhet', icon: 'icon-chart-pie-alt' },
    //   { name: 'tags', icon: 'icon-users' },
    //   { name: 'tumentech', icon: 'icon-users' },
    //   { name: 'webhooks', icon: 'icon-users' }
    // ];

    return (
      <Wrapper
        content={this.renderContent()}
        leftSidebar={<Leftbar />}
        // actionBar={
        //   <Wrapper.ActionBar
        //     right={actionButtons}
        //   />
        // }
        /* {plugins.map(plugin => {
          return (
            <Block key={plugin.name}>
              <p>
                <i className={plugin.icon} /> {plugin.name}
              </p>

              {enabledServices[plugin.name] ? (
                <>
                  <span>{loading[plugin.name] ? 'Loading ...' : ''}</span>
                  <div>
                    <button
                      onClick={manageInstall.bind(
                        this,
                        'uninstall',
                        plugin.name
                      )}
                      className="uninstall"
                    >
                      Uninstall
                    </button>

                    <button
                      onClick={manageInstall.bind(this, 'update', plugin.name)}
                      className="update"
                    >
                      Update
                    </button>

                    <div style={{ clear: 'both' }} />
                  </div>
                </>
              ) : (
                <button
                  onClick={manageInstall.bind(this, 'install', plugin.name)}
                >
                  {loading[plugin.name] ? 'Loading ...' : 'Install'}
                </button>
              )}
            </Block>
          );
        })} */
      />
    );
  }
}

export default withProps<{}>(
  compose(
    graphql<{}, {}, {}>(
      gql(`query enabledServices {
          enabledServices
        }`),
      {
        name: 'enabledServicesQuery'
      }
    ),
    graphql<{}>(gql(mutations.managePluginInstall), {
      name: 'manageInstall'
    })
  )(Installer)
);
