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
  Description,
  CreatorImage
} from '../styles';
import { Link } from 'react-router-dom';
import Tip from 'modules/common/components/Tip';

type Props = {
  plugins: any[];
};

class PluginPreview extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderList = () => {
    const { plugins } = this.props;

    return (
      <PluginContainer>
        {plugins.map(plugin => (
          <CardWrapper key={plugin.title}>
            <Link to={`installer/details/${plugin._id}`}>
              <Card>
                <PluginPic src={plugin.image} />
                <PluginInformation>
                  <b className="title">
                    {plugin.title}
                    {plugin.creator === 'erxes' && (
                      <Tip text="Made by erxes" placement="top">
                        <CreatorImage src="https://erxes.io/static/images/logo/glyph.png" />
                      </Tip>
                    )}
                  </b>
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
