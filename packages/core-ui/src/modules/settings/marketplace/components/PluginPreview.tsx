import React from 'react';

import { __ } from 'modules/common/utils';
import { Alert } from 'modules/common/utils';

import {
  ListContainer,
  ListHeader,
  ListTitle,
  ColorText,
  Card,
  PluginContainer,
  PluginPic,
  PluginInformation,
  Description
} from '../styles';
import { Link } from 'react-router-dom';

type Props = {
  onSearch?: (e) => void;
  clearSearch?: () => void;
  results?;
  enabledServicesQuery;
  manageInstall;
};

class PluginPreview extends React.Component<
  Props,
  { showInput: boolean; searchValue: string; loading: any; plugins: any[] }
> {
  constructor(props) {
    super(props);

    this.state = {
      showInput: false,
      searchValue: '',
      loading: {},
      plugins: []
    };
  }

  async componentDidMount() {
    fetch('https://erxes.io/plugins')
      .then(async response => {
        const plugins = await response.json();

        this.setState({ plugins });
      })
      .catch(e => {
        console.log(e);
      });
  }

  renderList = () => {
    const { enabledServicesQuery } = this.props;
    const { loading, plugins } = this.state;

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

    return (
      <PluginContainer>
        {plugins.map(plugin => (
          <Card key={plugin.title}>
            <Link to={`installer/details/${plugin._id}`}>
              <PluginPic src={plugin.image} />
              <PluginInformation>
                <b>{plugin.title}</b>
                <Description>{plugin.shortDescription}</Description>
              </PluginInformation>
            </Link>
            {enabledServices[plugin.title.toLowerCase()] ? (
              <>
                <span>
                  {loading[plugin.title.toLowerCase()] ? 'Loading ...' : ''}
                </span>
                <div>
                  <button
                    onClick={manageInstall.bind(
                      this,
                      'uninstall',
                      plugin.title.toLowerCase()
                    )}
                    className="uninstall"
                  >
                    Uninstall
                  </button>

                  <button
                    onClick={manageInstall.bind(
                      this,
                      'update',
                      plugin.title.toLowerCase()
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
                  plugin.title.toLowerCase()
                )}
                className="install"
              >
                {loading[plugin.title.toLowerCase()]
                  ? 'Loading ...'
                  : 'Install'}
              </button>
            )}
          </Card>
        ))}
      </PluginContainer>
    );
  };

  render() {
    return (
      <ListContainer>
        <ListHeader>
          <ListTitle>Plugins</ListTitle>
        </ListHeader>
        {this.renderList()}
      </ListContainer>
    );
  }
}

export default PluginPreview;
