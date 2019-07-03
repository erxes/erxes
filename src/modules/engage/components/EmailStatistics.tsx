import { Icon } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import React from 'react';
import {
  Box,
  BoxContent,
  BoxHeader,
  EngageBox,
  FlexItemCentered,
  IconContainer
} from '../styles';
import { IEngageMessage, IEngageStats } from '../types';

type Props = {
  message: IEngageMessage;
};

class EmailStatistics extends React.Component<Props> {
  renderBox(icon, name, type) {
    return (
      <Box>
        <BoxHeader>
          <IconContainer>
            <Icon icon={icon} />
          </IconContainer>
        </BoxHeader>
        <BoxContent>
          <h5>{name}</h5>
          {type || 0}
        </BoxContent>
      </Box>
    );
  }

  render() {
    const stats = this.props.message.stats || ({} as IEngageStats);

    const deliveryReports = Object.values(
      this.props.message.deliveryReports || {}
    );
    const totalCount = deliveryReports.length;

    const content = (
      <EngageBox>
        <FlexItemCentered>
          {this.renderBox('cube', 'Total', totalCount)}
        </FlexItemCentered>
        {this.renderBox('paper-plane-1', 'Sent', stats.send)}
        {this.renderBox('checked', 'Delivered', stats.delivery)}
        {this.renderBox('openlock', 'Opened', stats.open)}
        {this.renderBox('clicker', 'Clicked', stats.click)}
        {this.renderBox('sad', 'Complaint', stats.complaint)}
        {this.renderBox('basketball', 'Bounce', stats.bounce)}
        {this.renderBox('dislike', 'Rendering failure', stats.renderingfailure)}
        {this.renderBox('cancel', 'Rejected', stats.reject)}
      </EngageBox>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Show statistics')}
            breadcrumb={[{ title: __('Show statistics') }]}
          />
        }
        content={content}
      />
    );
  }
}

export default EmailStatistics;
