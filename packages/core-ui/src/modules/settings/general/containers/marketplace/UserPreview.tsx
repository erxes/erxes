import { colors, dimensions, typography } from '@erxes/ui/src/styles';
import { Flex } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
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

const UserCard = styled(Card)`
  display: flex;
  align-items: center;
  background: ${colors.bgMain};
`;

const UserPic = styled.div`
  width: 45px;
  margin: 7px;
  height: 45px;
  background: ${colors.colorWhite};
  border-radius: 2px;
`;

const UserInformation = styled.div`
  line-height: ${dimensions.unitSpacing}px;
  margin-right: 7px;
`;

const StyledText = styled.div`
  padding-top: ${dimensions.unitSpacing}px;
  display: flex;
  font-size: ${typography.fontSizeUppercase}px;
`;

type Props = {
  header: string;
  onSearch?: (e) => void;
  clearSearch?: () => void;
  results?;
};

class UserPreview extends React.Component<
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
          <UserCard>
            <UserPic />
            <UserInformation>
              <b>Frime</b>
              <StyledText>
                <GrayText>use{space}</GrayText>12 plugin combined
                <GrayText>
                  {space}in{space}
                </GrayText>
                <b>EXM</b>
              </StyledText>
            </UserInformation>
          </UserCard>
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

export default UserPreview;
