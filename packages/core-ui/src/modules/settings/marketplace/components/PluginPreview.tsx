import React from 'react';
import { __ } from 'modules/common/utils';
import {
  ListHeader,
  ListTitle,
  CardWrapper,
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
};

class PluginPreview extends React.Component<
  Props,
  { showInput: boolean; searchValue: string; plugins: any[] }
> {
  constructor(props) {
    super(props);

    this.state = {
      showInput: false,
      searchValue: '',
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
    const { plugins } = this.state;

    return (
      <PluginContainer>
        {plugins.map(plugin => (
          <CardWrapper key={plugin.title}>
            <Link to={`installer/details/${plugin._id}`}>
              <Card>
                <PluginPic src={plugin.image} />
                <PluginInformation>
                  <b>{plugin.title}</b>
                  <Description
                    dangerouslySetInnerHTML={{
                      __html: plugin.shortDescription
                    }}
                  />
                </PluginInformation>
              </Card>
            </Link>
          </CardWrapper>
        ))}
      </PluginContainer>
    );
  };

  render() {
    return (
      <>
        <ListHeader>
          <ListTitle>Plugins</ListTitle>
        </ListHeader>
        {this.renderList()}
      </>
    );
  }
}

export default PluginPreview;
