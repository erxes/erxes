import { DetailHeader, DetailTitle, FilePreview } from './styles';

import Attachment from '@erxes/ui/src/components/Attachment';
import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import LogRow from './LogRow';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import ShareForm from '../../containers/ShareForm';
import Table from '@erxes/ui/src/components/table';
import { Title } from '@erxes/ui/src/styles/main';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';
import { readFile } from '@erxes/ui/src/utils';

type Props = {
  item: any;
  history: any;
  logs: any;
};
class FileDetail extends React.Component<Props> {
  onContentChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  onChangeField = (key, e) => {
    this.setState({ [key]: e.currentTarget.value });
  };

  onCancel = () => {
    const { history } = this.props;

    history.push('/filemanager');
  };

  renderContent() {
    const { logs } = this.props;

    if (!logs || logs.length === 0) {
      return (
        <EmptyState
          image="/images/actions/5.svg"
          text="No file update at the moment!"
        />
      );
    }

    return (
      <>
        <DetailHeader>Logs</DetailHeader>
        <Table whiteSpace="wrap" hover={true} bordered={true} condensed={true}>
          <thead>
            <tr>
              <th>{__('Date')}</th>
              <th>{__('Created by')}</th>
              <th>{__('Module')}</th>
              <th>{__('Action')}</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <LogRow key={log._id} log={log} />
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  renderDetailInfo() {
    const { item } = this.props;
    const isFolder = item.folderId ? false : true;

    if (isFolder || item.type === 'dynamic') {
      return (
        <DetailTitle>
          {item.type === 'dynamic' ? (
            <>
              <Icon icon="file-alt" /> &nbsp;
            </>
          ) : (
            <img src={'/images/folder.png'} alt="folder" />
          )}
          {__(item.name)}
        </DetailTitle>
      );
    }

    return (
      <FilePreview>
        <Attachment
          attachment={{
            name: item.name,
            size: item.info && item.info.size,
            type: item.info && item.info.type,
            url: item.url
          }}
        />
      </FilePreview>
    );
  }

  render() {
    const { item } = this.props;
    const isDynamic = item.type === 'dynamic';

    const trigger = (
      <Button btnStyle="primary" icon="share-alt" type="button">
        {__('Share')}{' '}
        <small>(Shared with {item.sharedUsers.length || 0} members)</small>
      </Button>
    );

    const content = props => <ShareForm {...props} item={item} />;

    const actionButtons = (
      <>
        <Button
          btnStyle="simple"
          icon="leftarrow-3"
          type="button"
          onClick={this.onCancel}
        >
          {__('Back')}
        </Button>

        <ModalTrigger
          title="Share File"
          trigger={trigger}
          content={content}
          centered={true}
          enforceFocus={false}
        />

        {item.folderId && (
          <a href={isDynamic ? '#' : readFile(item.url)}>
            <Button
              btnStyle="success"
              type="button"
              icon={isDynamic ? 'print' : 'download-1'}
            >
              {isDynamic ? __('Print') : __('Download')}
            </Button>
          </a>
        )}
      </>
    );

    const breadcrumb = [
      { title: __('File manager'), link: '/filemanager' },
      { title: __(item.name) }
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('File manager')} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={this.renderDetailInfo()}
            right={actionButtons}
          />
        }
        content={this.renderContent()}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default FileDetail;
