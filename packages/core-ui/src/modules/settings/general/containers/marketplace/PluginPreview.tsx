import Icon from 'modules/common/components/Icon';
import Button from 'modules/common/components/Button';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { Flex } from '@erxes/ui/src/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';
import {
  ListContainer,
  ListHeader,
  ListTitle,
  ColorText,
  Card,
  GrayText
} from './styles';

const PluginPic = styled.div`
  width: 100%;
  background: ${colors.bgMain};
  height: 110px;
  border-radius: 4px;
`;

const PluginInformation = styled.div`
  margin: ${dimensions.unitSpacing}px 0 ${dimensions.unitSpacing}px 0;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Rating = styled.div`
  height: ${dimensions.coreSpacing}px;
  width: 90px;
  background: ${colors.bgGray};
`;

type Props = {
  header?: string;
  onSearch?: (e) => void;
  clearSearch?: () => void;
  results?;
  loading?: boolean;
};

class PluginPreview extends React.Component<
  Props,
  { showInput: boolean; searchValue: string }
> {
  // private wrapperRef;

  constructor(props) {
    super(props);

    this.state = { showInput: false, searchValue: '' };
  }

  renderList = () => {
    const ids = [1, 2, 3, 4];
    const space = '\u00a0';

    return (
      <Flex>
        {ids.map(id => (
          <Card>
            <PluginPic />
            <PluginInformation>
              <b>Ecommerce plugin</b>
              <Flex>
                <GrayText>by{space}</GrayText>New media group
                <GrayText>
                  {space}in{space}
                </GrayText>
                <b>EXM</b>
              </Flex>
            </PluginInformation>
            <Footer>
              <Flex>
                <Rating /> {/* replace with rating stars* */}
                <GrayText>
                  {space}
                  <b>/412/</b>
                </GrayText>
              </Flex>
              <Flex>
                <Button size="small">
                  <Icon
                    icon="shopping-cart-alt"
                    size={15}
                    color={colors.colorPrimary}
                  />
                </Button>
                <Button size="small">
                  <b>Install</b>
                </Button>
              </Flex>
            </Footer>
          </Card>
        ))}
      </Flex>
    );
  };

  render() {
    return (
      <ListContainer>
        <ListHeader>
          <ListTitle>{this.props.header}</ListTitle>
          <ColorText>View all</ColorText>
        </ListHeader>
        {this.renderList()}
      </ListContainer>
    );
  }
}

export default PluginPreview;
