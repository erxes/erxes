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
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { getEnv, __ } from '@erxes/ui/src/utils';
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

  getPrintUrl = () => {
    const { item } = this.props;

    return `${getEnv().REACT_APP_API_URL}/pl:documents/print?_id=${
      item.documentId
    }&itemId=${item.contentTypeId}`;
  };

  renderDocumentPreview() {
    const { item } = this.props;

    if (item.type !== 'dynamic') {
      return null;
    }

    return (
      <div style={{ marginTop: '50px;', marginLeft: '20px' }}>
        <h3>Preview</h3>

        <iframe
          src={this.getPrintUrl()}
          style={{ width: '100%', border: 'none', height: '700px' }}
        />
      </div>
    );
  }

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

        {this.renderDocumentPreview()}
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
              href={this.getPrintUrl()}
              target="__blank"
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
