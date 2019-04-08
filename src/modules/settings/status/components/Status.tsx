import { HeaderDescription, Icon } from 'modules/common/components';
import { FullContent, MiddleContent } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { Box, Group, Title } from '../styles';
import { ProjectVersions, Version } from '../types';

class Status extends React.Component<{ versions: ProjectVersions }> {
  renderData(title: string, version?: Version) {
    const ver = version || ({} as Version);

    return (
      <Box>
        <Title>{__(title)}</Title>

        <Group>
          <span>
            <Icon icon="information" /> {__('Info')}
          </span>
          <div>
            <b>{__('Package version')}</b> - {ver.packageVersion}
          </div>
          <div>
            <b>{__('Branch name')}</b> - {ver.branch}
          </div>
          <div>
            <b>{__('Sha')}</b> - {ver.sha}
          </div>
          <div>
            <b>
              {__('Abbreviated')} {__('Sha')}
            </b>{' '}
            - {ver.abbreviatedSha}{' '}
          </div>
        </Group>
        <Group>
          <span>
            <Icon icon="wallclock" /> Last commit{' '}
          </span>
          <div>
            <b>{__('Message')}</b> - {ver.lastCommitMessage}
          </div>
          <div>
            <b>{__('User')}</b> - {ver.lastCommittedUser}
          </div>
          <div>
            <b>{__('Date')}</b> - {ver.lastCommittedDate}
          </div>
        </Group>
      </Box>
    );
  }

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('System status') }
    ];

    const { versions } = this.props;

    const {
      erxesVersion,
      apiVersion,
      widgetVersion,
      widgetApiVersion
    } = versions;

    const content = (
      <div>
        {this.renderData('Erxes Status', erxesVersion)}

        {this.renderData('Erxes API Status', apiVersion)}

        {this.renderData('Erxes Widget Status', widgetVersion)}

        {this.renderData('Widget Api Version', widgetApiVersion)}
      </div>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
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
