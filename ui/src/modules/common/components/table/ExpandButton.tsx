// import Button from 'modules/common/components/Button';
// import { rgba } from 'modules/common/styles/color';
// import colors from 'modules/common/styles/colors';
// import dimensions from 'modules/common/styles/dimensions';
import { SimpleButton } from 'modules/common/styles/main';
import React from 'react';
// import styled from 'styled-components';
import Icon from '../Icon';
import Tip from '../Tip';

// const ExpandRowWrapper = styled.div`
//   background: ${rgba(colors.colorBlack, 0.05)};
//   color: ${colors.colorCoreGray};
//   transition: background 0.3s ease;
//   padding: 2px ${dimensions.unitSpacing}px;
//   border-radius: ${dimensions.unitSpacing}px;
//   cursor: pointer;

//   &.active {
//     background: ${rgba(colors.colorSecondary, 0.1)};
//     color: ${colors.colorSecondary};
//   }
// `;

type Props = {};

type State = {
  isExpandRow: boolean;
};

class ExpandButton extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isExpandRow:
        localStorage.getItem('isExpandCompanyTable') === 'true'
          ? true
          : false || false
    };
  }

  onExpandRow = () => {
    this.setState({ isExpandRow: !this.state.isExpandRow }, () => {
      localStorage.setItem(
        'isExpandCompanyTable',
        this.state.isExpandRow.toString()
      );
    });
  };

  render() {
    return (
      <Tip
        text={this.state.isExpandRow ? 'Shrink table row' : 'Expand table row'}
        placement="bottom"
      >
        <SimpleButton
          isActive={this.state.isExpandRow}
          onClick={this.onExpandRow}
        >
          <Icon icon="expand-arrows-alt" size={14} />
        </SimpleButton>
      </Tip>
    );
  }
}

export default ExpandButton;
