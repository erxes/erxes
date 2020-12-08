import HeaderDescription from 'modules/common/components/HeaderDescription';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Box, Group, Title } from '../styles';
import { ProjectStatistics } from '../types';
import { formatDuration, formatMemorySize } from '../utils';

class Status extends React.PureComponent<{
  statistics: ProjectStatistics;
}> {
  renderStatistic(type) {
    const statistic = this.props.statistics[type] || {};

    const { os, process, mongo } = statistic;

    if (!process) {
      return null;
    }

    return (
      <>
        <div>
          <b>{__('Uptime')}</b> - {formatDuration(process.uptime)}
        </div>
        <div>
          <b>{__('PID')}</b> - {process.pid}
        </div>
        <div>
          <b>{__('OS Type')}</b> - {os.type}
        </div>
        <div>
          <b>{__('OS Platform')}</b> - {os.platform}
        </div>
        <div>
          <b>{__('OS Arch')}</b> - {os.arch}
        </div>
        <div>
          <b>{__('OS Release')}</b> - {os.release}
        </div>
        <div>
          <b>{__('Node Version')}</b> - {process.nodeVersion}
        </div>
        <div>
          <b>{__('Mongo Version')}</b> - {mongo.version}
        </div>
        <div>
          <b>{__('Mongo Storage Engine')}</b> - {mongo.storageEngine}
        </div>
        <div>
          <b>{__('OS Uptime')}</b> - {formatDuration(os.uptime)}
        </div>
        <div>
          <b>{__('OS Total Memory')}</b> - {formatMemorySize(os.totalmem)}
        </div>
        <div>
          <b>{__('OS Free Memory')}</b> - {formatMemorySize(os.freemem)}
        </div>
        <div>
          <b>{__('OS CPU Count')}</b> - {os.cpuCount}
        </div>
      </>
    );
  }

  renderBody(type: string) {
    switch (type) {
      case 'erxesIntegration':
      case 'erxesApi': {
        return this.renderStatistic(type);
      }
      default: {
        return null;
      }
    }
  }

  renderData(title: string, type: string) {
    return (
      <Box>
        <Title>{__(title)}</Title>

        <Group>
          <span>
            <Icon icon="info-circle" /> {__('Info')}
          </span>
          <div>{this.renderBody(type)}</div>
        </Group>
      </Box>
    );
  }

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('System status') }
    ];

    const content = (
      <div>
        {this.renderData('Erxes api status', 'erxesApi')}
        {this.renderData('Erxes integration status', 'erxesIntegration')}
      </div>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('System status')} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={
              <HeaderDescription
                icon="/images/actions/28.svg"
                title="System status"
                description={`This allows you to see erxes's real-time information on all system statuses. You'll find live and historical data on system performance.`}
              />
            }
          />
        }
        content={content}
        transparent={true}
        center={true}
      />
    );
  }
}

export default Status;
