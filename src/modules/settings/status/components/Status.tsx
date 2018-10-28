import { Icon } from 'modules/common/components';
import { FullContent } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import { Box, Group, MiddleContent, Title } from '../styles';
import { ProjectVersions, Version } from '../types';

class Status extends React.Component<{ versions: ProjectVersions }> {
  renderData(title: string, version: Version) {
    return (
      <Box>
        <Title>{title}</Title>

        <Group>
          <span>
            <Icon icon="information" /> Info
          </span>
          <div>
            <b>Package version</b> - {version.packageVersion}
          </div>
          <div>
            <b>Branch name</b> - {version.branch}
          </div>
          <div>
            <b>Sha</b> - {version.sha}
          </div>
          <div>
            <b>Abbreviated Sha</b> - {version.abbreviatedSha}{' '}
          </div>
        </Group>
        <Group>
          <span>
            <Icon icon="wallclock" /> Last commit{' '}
          </span>
          <div>
            <b>Message</b> - {version.lastCommitMessage}
          </div>
          <div>
            <b>User</b> - {version.lastCommittedUser}
          </div>
          <div>
            <b>Date</b> - {version.lastCommittedDate}
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
      <FullContent center={true}>
        <MiddleContent>
          {this.renderData('Erxes Status', erxesVersion)}

          {this.renderData('Erxes API Status', apiVersion)}

          {this.renderData('Erxes Widget Status', widgetVersion)}

          {this.renderData('Widget Api Version', widgetApiVersion)}
        </MiddleContent>
      </FullContent>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default Status;
