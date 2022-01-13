import Icon from 'modules/common/components/Icon';
import { colors } from 'modules/common/styles';
import { BoxRoot, FullContent } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { FlexItem, FlexPad } from 'modules/common/components/step/styles';
import React from 'react';
import styled from 'styled-components';
import { SubHeading } from 'modules/settings/styles';

const Box = styled(BoxRoot)`
  width: 320px;
  padding: 40px;
  background: ${colors.bgLight};

  i {
    font-size: 38px;
    color: ${colors.colorSecondary};
  }

  span {
    font-weight: 500;
    text-transform: capitalize;
  }

  p {
    margin: 10px 0 0;
    font-size: 12px;
    color: ${colors.colorCoreLightGray};
    min-height: 36px;
  }

  &:last-of-type {
    margin-right: 0;
  }
`;

type Props = {};

class ConfigsForm extends React.Component<Props> {
  renderBox(name, icon, desc) {
    return (
      <Box selected={name === 'Excel'}>
        <Icon icon={icon} />
        <span>{__(name)}</span>
        <p>{__(desc)}</p>
      </Box>
    );
  }

  render() {
    return (
      <FlexItem>
        <FlexPad direction="column" overflow="auto">
          <SubHeading>{__('Export as')}</SubHeading>

          <FullContent center={true}>
            {this.renderBox('Excel', 'xls', ``)}
            {this.renderBox('CSV', 'csv-import', 'Coming soon')}
          </FullContent>
        </FlexPad>
      </FlexItem>
    );
  }
}

export default ConfigsForm;
