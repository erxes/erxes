import {
  ActionButtonsWrapper,
  DetailTitle,
  DocumentPreview,
  FilePreview,
  FlexRow
} from './styles';
import { IAccessRequests, ILogs } from '../../types';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';
import { __, getEnv } from '@erxes/ui/src/utils';
import { readFile, renderUserFullName } from '@erxes/ui/src/utils';

import AckList from '../../containers/file/AckList';
import Attachment from '@erxes/ui/src/components/Attachment';
import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import LogRow from './LogRow';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import RelatedFileList from './RelatedFilesList';
import RelatedForm from '../../containers/file/RelatedForm';
import RequestAccessForm from '../../containers/file/RequestAccessForm';
import RequestedAckList from '../../containers/file/RequestedAckList';
import RequestedFilesList from '../../containers/file/RequestedFilesList';
import ShareForm from '../../containers/ShareForm';
import Table from '@erxes/ui/src/components/table';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import withTableWrapper from '@erxes/ui/src/components/table/withTableWrapper';

type Props = {
  item: any;
  history: any;
  logs: ILogs[];
  folderId: string;
  fileId: string;
  isViewPermissionDenied: boolean;
  requestAck: (vars: any, callback?: any) => void;
};

type State = {
  currentTab: string;
  description: string;
};

class FileDetail extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'logs',
      description: ''
    };
  }

  onCancel = () => {
    const { history } = this.props;

    history.push('/filemanager');
  };

  onAcknowledge = callback => {
    const { requestAck, fileId } = this.props;

    requestAck(
      {
        fileId,
        description: this.state.description
      },
      callback
    );
  };

  onTabClick = (currentTab: string) => {
    this.setState({ currentTab });
  };

  readUrl = () => {
    const { item } = this.props;

    if (item.type === 'dynamic') {
      return `${getEnv().REACT_APP_API_URL}/pl:documents/print?_id=${
        item.documentId
      }&itemId=${item.contentTypeId}`;
    }

    return readFile(item.url);
  };

  renderDocumentPreview() {
    const { item } = this.props;

    if (item.type !== 'dynamic') {
      return null;
    }

    return (
      <DocumentPreview>
        <h3>Preview</h3>

        <iframe src={this.readUrl()} />
      </DocumentPreview>
    );
  }

  renderLogs() {
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
        <withTableWrapper.Wrapper>
          <Table
            whiteSpace="wrap"
            hover={true}
            bordered={true}
            condensed={true}
            responsive={true}
            wideHeader={true}
          >
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
        </withTableWrapper.Wrapper>

        {this.renderDocumentPreview()}
      </>
    );
  }

  renderTabContent() {
    const { item, folderId, fileId } = this.props;

    switch (this.state.currentTab) {
      case 'related':
        return (
          <RelatedFileList
            files={item.relatedFiles || []}
            folderId={folderId}
          />
        );
      case 'requested':
        return <RequestedFilesList fileId={fileId} />;
      case 'acknowledges':
        return <RequestedAckList fileId={fileId} folderId={folderId} />;
      case 'ackByUser':
        return <AckList fileId={fileId} folderId={folderId} />;
      default:
        return this.renderLogs();
    }
  }

  renderContent() {
    const { currentTab } = this.state;

    return (
      <>
        <Tabs>
          <TabTitle
            className={currentTab === 'logs' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'logs')}
          >
            {__('Logs')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'related' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'related')}
          >
            <>
              {__('Related files')}(
              {this.props.item.relatedFiles
                ? this.props.item.relatedFiles.length
                : 0}
              )
            </>
          </TabTitle>
          <TabTitle
            className={currentTab === 'requested' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'requested')}
          >
            {__('Requested files')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'acknowledges' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'acknowledges')}
          >
            {__('Acknowledges')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'ackByUser' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'ackByUser')}
          >
            {__('Requested acknowledges')}
          </TabTitle>
        </Tabs>
        {this.renderTabContent()}
      </>
    );
  }

  renderSharedInfo() {
    const { sharedUsers = [] } = this.props.item || {};

    return (
      <Label lblStyle="success" ignoreTrans={true}>
        <>
          Shared with {sharedUsers.length || 0} member
          {sharedUsers.map(user => (
            <React.Fragment key={user._id}>
              {renderUserFullName(user)}, &nbsp;
            </React.Fragment>
          ))}
        </>
      </Label>
    );
  }

  renderDetailInfo() {
    const { item } = this.props;
    const isFolder = item.folderId ? false : true;

    if (isFolder || item.type === 'dynamic') {
      return (
        <FlexRow>
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
          {this.renderSharedInfo()}
        </FlexRow>
      );
    }

    return (
      <FilePreview>
        <Attachment
          large={true}
          attachment={{
            name: item.name,
            size: item.info && item.info.size,
            type: item.info && item.info.type,
            url: readFile(item.url)
          }}
        />
      </FilePreview>
    );
  }

  renderAckForm = props => {
    const onChange = e =>
      this.setState({ description: (e.target as HTMLInputElement).value });

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <p>{__('You can write description or not')}</p>
          <FormControl
            name="description"
            componentClass="textarea"
            rows={3}
            onChange={onChange}
            autoFocus={true}
            value={this.state.description}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={props.closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          <Button
            type="submit"
            btnStyle="success"
            icon="key-skeleton-alt"
            onClick={() => this.onAcknowledge(props.closeModal)}
          >
            {__('Request')}
          </Button>
        </ModalFooter>
      </>
    );
  };

  render() {
    const { item, folderId, isViewPermissionDenied } = this.props;
    const isDynamic = item.type === 'dynamic';

    const breadcrumb = [
      { title: __('File manager'), link: '/filemanager' },
      { title: __(item.name) }
    ];

    const trigger = (
      <Button btnStyle="primary" icon="share-alt" type="button">
        {__('Share')}
      </Button>
    );

    const relatedTrigger = (
      <Button btnStyle="primary" icon="settings" type="button">
        {__('Manage related files')}
      </Button>
    );

    const content = props => <ShareForm {...props} item={item} />;
    const relatedFileChooser = props => (
      <RelatedForm {...props} item={item} folderId={folderId} />
    );

    const actionButtons = (
      <ActionButtonsWrapper>
        <div>
          <Button
            btnStyle="simple"
            icon="leftarrow-3"
            type="button"
            onClick={this.onCancel}
          >
            {__('Back')}
          </Button>
          {this.renderSharedInfo()}
        </div>
        <div>
          <ModalTrigger
            title="Share File"
            trigger={trigger}
            content={content}
            centered={true}
            enforceFocus={false}
          />

          <ModalTrigger
            title="Manage related files"
            trigger={relatedTrigger}
            content={relatedFileChooser}
            centered={true}
            enforceFocus={false}
            size={'lg'}
          />

          <ModalTrigger
            title="Acknowledge file"
            trigger={
              <Button btnStyle="primary" icon="hold" type="button">
                {__('Request acknowledge')}
              </Button>
            }
            content={props => this.renderAckForm(props)}
            centered={true}
            enforceFocus={false}
          />

          {item.folderId && (
            <Button
              btnStyle="success"
              type="button"
              href={this.readUrl()}
              target="__blank"
              icon={isDynamic ? 'print' : 'download-1'}
            >
              {isDynamic ? __('Print') : __('Download')}
            </Button>
          )}
        </div>
      </ActionButtonsWrapper>
    );

    if (isViewPermissionDenied) {
      return <RequestAccessForm fileId={this.props.fileId} />;
    }

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
