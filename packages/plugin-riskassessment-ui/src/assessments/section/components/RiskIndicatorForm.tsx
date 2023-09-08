import GenerateField from '@erxes/ui-forms/src/settings/properties/components/GenerateField';
import { UploaderWrapper } from '@erxes/ui-inbox/src/settings/integrations/components/mail/styles';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  ModalTrigger,
  Uploader,
  __,
  colors
} from '@erxes/ui/src';
import { FormColumn, ModalFooter } from '@erxes/ui/src/styles/main';
import { IField } from '@erxes/ui/src/types';
import { readFile } from '@erxes/ui/src/utils/core';
import { default as _loadash } from 'lodash';
import React from 'react';
import { Divider, ListItem, Padding } from '../../../styles';
import IndicatorAssessmentHistory from '../containers/IndicatorAssessmentHistory';

type Props = {
  fields: IField[];
  submittedFields: any;
  withDescription: boolean;
  submitForm: (doc: any) => void;
  closeModal: () => void;
  onlyPreview?: boolean;
  indicatorId: string;
  branchId: string;
  departmentId: string;
  operationId: string;
  checkTestScore: (variables: any) => void;
};

type State = {
  submissions: {
    [key: string]: {
      value: string;
      description: string;
      isFlagged?: boolean;
      attachments?: any;
    };
  };
};

class IndicatorForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      submissions: {}
    };
  }

  componentDidMount() {
    if (
      JSON.stringify(this.props.submittedFields) !==
      JSON.stringify(this.state.submissions)
    ) {
      this.setState({ submissions: this.props.submittedFields });
    }
  }

  renderFieldAdditionalContent(
    {
      description,
      attachments
    }: {
      value: string;
      description: string;
      isFlagged?: boolean;
      attachments?: any;
    },
    _id: string
  ) {
    const { submissions } = this.state;

    const onChange = e => {
      const { value, name } = e.currentTarget as HTMLInputElement;
      submissions[_id] = {
        ...submissions[_id],
        [name]: value
      };
      this.setState({ submissions });
    };

    const onChangeAttachments = e => {
      for (const att of e) {
        att.url = readFile(att.url);
      }
      submissions[_id] = {
        ...submissions[_id],
        attachments: e
      };
      this.setState({ submissions });
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            name="description"
            componentClass="textarea"
            placeholder="Type some description"
            onChange={onChange}
            value={description}
          />
        </FormGroup>
        <UploaderWrapper>
          <Uploader
            defaultFileList={attachments || []}
            onChange={onChangeAttachments}
          />
        </UploaderWrapper>
      </>
    );
  }

  renderMoreForm(field, props) {
    const { submissions } = this.state;

    const content = () => (
      <>
        <GenerateField {...props} />
        {this.renderFieldAdditionalContent(
          submissions[field._id] || {},
          field._id
        )}
      </>
    );

    const trigger = (
      <Button btnStyle="link" icon="ellipsis-h">
        {__('More')}
      </Button>
    );

    return (
      <ModalTrigger title="Field Form" content={content} trigger={trigger} />
    );
  }

  renderField(field: IField) {
    const { withDescription } = this.props;
    const { submissions } = this.state;
    const handleChange = field => {
      let value = field.value;

      if (typeof field.value === 'object') {
        value = JSON.stringify(field.value);
      }

      this.setState(prev => ({
        submissions: {
          ...prev.submissions,
          [field._id]: { ...prev.submissions[field._id], value }
        }
      }));
    };
    const handleFlag = () => {
      submissions[field._id] = {
        ...submissions[field._id],
        isFlagged: !submissions[field._id]?.isFlagged
      };
      this.setState({ submissions });
    };

    const updateProps: any = {
      isEditing: false,
      key: field.key,
      field,
      onValueChange: handleChange,
      isPreview: true
    };

    if (field.type === 'file' && submissions[field._id]?.value) {
      updateProps.defaultValue = JSON.parse(submissions[field._id].value);
    } else {
      updateProps.defaultValue = submissions[field._id]?.value;
    }

    return (
      <ListItem key={field._id}>
        <GenerateField {...updateProps} />
        <FormColumn>
          <Button
            btnStyle="link"
            icon="flag"
            iconColor={
              submissions[field._id]?.isFlagged ? colors.colorCoreRed : ''
            }
            onClick={handleFlag}
          >
            {submissions[field._id]?.isFlagged ? 'Flagged' : 'Flag'}
          </Button>
          {withDescription && this.renderMoreForm(field, updateProps)}
        </FormColumn>
      </ListItem>
    );
  }

  render() {
    const {
      fields,
      submittedFields,
      closeModal,
      onlyPreview,
      indicatorId,
      branchId,
      departmentId,
      operationId,
      checkTestScore
    } = this.props;

    const setHistory = submissions => {
      this.setState({ submissions });
    };

    const submitForm = () => {
      const { submitForm } = this.props;
      const { submissions } = this.state;
      submitForm({
        formSubmissions: submissions
      });
    };

    const handleTestScore = () => {
      const { submissions } = this.state;
      checkTestScore({ indicatorId, formSubmissions: submissions });
    };

    return (
      <>
        <IndicatorAssessmentHistory
          indicatorId={indicatorId}
          branchId={branchId}
          departmentId={departmentId}
          operationId={operationId}
          setHistory={setHistory}
        />
        <Padding horizontal>
          {(fields || []).map(field => (
            <>
              {this.renderField(field)}
              <Divider />
            </>
          ))}
        </Padding>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Cancel')}
          </Button>
          <Button btnStyle="warning" onClick={handleTestScore}>
            {__('Check Test Score')}
          </Button>
          {_loadash.isEmpty(submittedFields) && !onlyPreview && (
            <Button btnStyle="success" onClick={submitForm}>
              {__('Save')}
            </Button>
          )}
        </ModalFooter>
      </>
    );
  }
}

export default IndicatorForm;
