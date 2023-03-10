import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
// import EditorCK from "../containers/EditorCK";
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import React from 'react';
import { Title } from '@erxes/ui/src/styles/main';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';

type Props = {
  item: any;
  history: any;
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

  render() {
    const { item } = this.props;

    const formContent = <div>content</div>;

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

        <Button btnStyle="success" type="button">
          {__('Download')}
        </Button>
      </>
    );

    const breadcrumb = [
      { title: __('File manager'), link: '/filemanager' }
      // { title: __("Documents"), link: "/documents" },
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('File manager')} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('File manager')}</Title>}
            right={actionButtons}
          />
        }
        content={formContent}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default FileDetail;
