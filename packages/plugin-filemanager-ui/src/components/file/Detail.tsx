import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
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

  renderObjects() {
    const { logs } = this.props;

    if (!logs || logs.length === 0) {
      return (
        <EmptyState
          image="/images/actions/5.svg"
          text="No file update at the moment!"
        />
      );
    }

    return logs.map(log => <LogRow key={log._id} log={log} />);
  }

  renderContent() {
    return (
      <Table whiteSpace="wrap" hover={true} bordered={true} condensed={true}>
        <thead>
          <tr>
            <th>{__('Date')}</th>
            <th>{__('Created by')}</th>
            <th>{__('Module')}</th>
            <th>{__('Action')}</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }

  render() {
    const { item } = this.props;
    const isDynamic = item.type === 'dynamic';

    const trigger = (
      <Button btnStyle="primary" icon="share-alt" type="button">
        {__('Share')}
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

        <a href={isDynamic ? '#' : readFile(item.url)}>
          <Button
            btnStyle="success"
            type="button"
            icon={isDynamic ? 'print' : 'download-1'}
          >
            {isDynamic ? __('Print') : __('Download')}
          </Button>
        </a>
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
            left={
              <>
                <Title>{__(item.name)}</Title>
              </>
            }
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
