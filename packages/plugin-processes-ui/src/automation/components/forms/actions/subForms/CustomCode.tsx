import React from 'react';
import { IAction } from '../../../../types';
import Common from '../Common';
import { BoardHeader, DrawerDetail } from '../../../../styles';
import { __ } from 'coreui/utils';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import { ControlLabel } from '@erxes/ui/src/components/form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IJob } from '../../../../../flow/types';

type Props = {
  closeModal: () => void;
  onSave: () => void;
  activeAction: IJob;
  triggerType: string;
  addAction: (action: IJob, actionId?: string, jobReferId?: string) => void;
};

type State = {
  jobReferId: string;
};

class Delay extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { jobReferId: '' };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeAction !== this.props.activeAction) {
      this.setState({ jobReferId: nextProps.activeAction.jobReferId });
    }
  }

  onChangeField = (value: string) => {
    this.setState({ jobReferId: value });
  };

  renderContent() {
    const { jobReferId } = this.state;

    const onChangeValue = code => this.onChangeField(code);

    return (
      <DrawerDetail>
        <FormGroup>
          <BoardHeader>
            <div className="header-row">
              <ControlLabel required={true}>{__('Value')}</ControlLabel>
            </div>
            <Editor
              value={jobReferId || ''}
              onValueChange={onChangeValue}
              highlight={code => highlight(code, languages.javascript)}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12
              }}
            />
          </BoardHeader>
        </FormGroup>
      </DrawerDetail>
    );
  }

  render() {
    return (
      <Common jobReferId={this.state.jobReferId} {...this.props}>
        {this.renderContent()}
      </Common>
    );
  }
}

export default Delay;
