import GenerateField from '@erxes/ui-forms/src/settings/properties/components/GenerateField';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  __,
  colors
} from '@erxes/ui/src';
import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import { IField } from '@erxes/ui/src/types';
import { default as _loadash } from 'lodash';
import React from 'react';
import { Padding } from '../../../styles';
import { DetailPopOver } from '../../common/utils';
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
};

type State = {
  submissions: {
    [key: string]: { value: string; description: string; isFlagged?: boolean };
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

  renderDescriptionField(value, key: string) {
    const { withDescription } = this.props;
    if (!withDescription) {
      return;
    }

    const onChangeDescription = e => {
      const { submissions } = this.state;
      const { value } = e.currentTarget as HTMLInputElement;

      submissions[key] = {
        ...submissions[key],
        description: value
      };

      this.setState({ submissions });
    };

    return (
      <DetailPopOver title="" withoutPopoverTitle icon="comment-alt-edit">
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            name="description"
            componentClass="textarea"
            placeholder="Type some description"
            onChange={onChangeDescription}
            value={value}
          />
        </FormGroup>
      </DetailPopOver>
    );
  }

  renderField(field: IField) {
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
      <FormWrapper key={field._id}>
        <FormColumn>
          <GenerateField {...updateProps} />
        </FormColumn>
        <Button
          btnStyle="link"
          icon="flag"
          iconColor={
            submissions[field._id]?.isFlagged ? colors.colorCoreRed : ''
          }
          onClick={handleFlag}
        />
        {this.renderDescriptionField(
          submissions[field._id]?.description || '',
          field._id
        )}
      </FormWrapper>
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
      operationId
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
          {(fields || []).map(field => this.renderField(field))}
        </Padding>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Cancel')}
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
