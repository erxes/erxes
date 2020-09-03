import HeaderDescription from 'modules/common/components/HeaderDescription';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Box, Group, Title } from '../styles';
import { ProjectVersions } from '../types';
import { formatDuration, formatMemorySize } from '../utils';

class Status extends React.PureComponent<{
  versions: ProjectVersions;
}> {
  renderGeneral() {
    const { generalInfo, processInfo } = this.props.versions;

    return (
      <>
        <div>
          <b>{__('Package version')}</b> - {generalInfo.packageVersion}
        </div>
        <div>
          <b>{__('Uptime')}</b> - {formatDuration(processInfo.uptime)}
        </div>
        <div>
          <b>{__('PID')}</b> - {processInfo.pid}
        </div>
      </>
    );
  }

  renderRunTime() {
    const { osInfo, processInfo, mongoInfo } = this.props.versions;

    return (
      <>
        <div>
          <b>{__('OS Type')}</b> - {osInfo.type}
        </div>
        <div>
          <b>{__('OS Platform')}</b> - {osInfo.platform}
        </div>
        <div>
          <b>{__('OS Arch')}</b> - {osInfo.arch}
        </div>
        <div>
          <b>{__('OS Release')}</b> - {osInfo.release}
        </div>
        <div>
          <b>{__('Node Version')}</b> - {processInfo.nodeVersion}
        </div>
        <div>
          <b>{__('Mongo Version')}</b> - {mongoInfo.version}
        </div>
        <div>
          <b>{__('NMongo Storage Engine')}</b> - {mongoInfo.storageEngine}
        </div>
        <div>
          <b>{__('OS Uptime')}</b> - {formatDuration(osInfo.uptime)}
        </div>
        <div>
          <b>{__('OS Total Memory')}</b> - {formatMemorySize(osInfo.totalmem)}
        </div>
        <div>
          <b>{__('OS Free Memory')}</b> - {formatMemorySize(osInfo.freemem)}
        </div>
        <div>
          <b>{__('OS CPU Count')}</b> - {osInfo.cpuCount}
        </div>
      </>
    );
  }

  renderBody(type: string) {
    switch (type) {
      case 'runTime': {
        return this.renderRunTime();
      }
      case 'general': {
        return this.renderGeneral();
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
        {this.renderData('General', 'general')}

        {this.renderData('Runtime Environment', 'runTime')}
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
