import {
  Button,
  confirm,
  ControlLabel,
  Form as CommonForm,
  FormControl,
  FormGroup,
  __
} from '@erxes/ui/src';
import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import { FormContainer } from '../../../styles';
import { SelectTags } from '../../common/utils';
import { IIndicatorsGroups } from '../common/types';
import GroupingIndicators from './GroupingIndicators';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  detail?: IIndicatorsGroups;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  detail: IIndicatorsGroups;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      detail: props.detail || {}
    };

    this.renderContent = this.renderContent.bind(this);
  }

  generateDoc(values) {
    const { detail } = this.state;

    (detail.calculateLogics || []).forEach(
      calculateLogics => delete calculateLogics.__typename
    );

    (detail.groups || []).forEach((group: any) => {
      delete group.__typename;
      (group?.calculateLogics || []).forEach(element => {
        delete element.__typename;
      });
    });

    return { ...detail, ...values };
  }

  renderContent(formProps: IFormProps) {
    const { detail } = this.state;

    const { values, isSubmitted } = formProps;

    const handleClose = () => {
      if (!this.props.detail && detail) {
        return confirm(
          'Are you sure you want to close.You will lose your filled data if you close the form '
        ).then(() => {
          this.props.closeModal();
        });
      }
      this.props.closeModal();
    };

    const handleChange = doc => {
      this.setState({ detail: { ...this.props.detail, ...doc } });
    };

    const handleSelect = (values, name) => {
      this.setState(prev => ({ detail: { ...prev.detail, [name]: values } }));
    };

    const toggleProperty = e => {
      const { name } = e.currentTarget as HTMLInputElement;
      this.setState({ detail: { ...detail, [name]: !detail[name] } });
    };

    return (
      <FormContainer column gap>
        <FormGroup>
          <ControlLabel>{__('Name')}</ControlLabel>
          <FormControl
            {...formProps}
            type="text"
            name="name"
            defaultValue={detail?.name}
            required
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            {...formProps}
            componentClass="textarea"
            name="description"
            defaultValue={detail?.name}
            required
          />
        </FormGroup>
        {isEnabled('tags') && (
          <FormGroup>
            <ControlLabel>{__('Tag')}</ControlLabel>
            <SelectTags
              name="tagIds"
              label="Choose Tag"
              initialValue={detail.tagIds}
              onSelect={handleSelect}
              multi
            />
          </FormGroup>
        )}
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <FormControl
                name="ignoreZeros"
                componentClass="checkbox"
                checked={detail.ignoreZeros}
                onChange={toggleProperty}
              />
              <ControlLabel>
                {__(
                  'Ignore Zeros ( ignore percent weight if assessment equals zero )'
                )}
              </ControlLabel>
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <GroupingIndicators
          handleChange={handleChange}
          indicatorGroups={detail.groups}
          generalConfig={{
            calculateLogics: detail.calculateLogics,
            calculateMethod: detail.calculateMethod
          }}
        />
        <ModalFooter>
          <Button btnStyle="simple" onClick={handleClose}>
            {__('Cancel')}
          </Button>
          {this.props.renderButton({
            text: 'Indicators Groups',
            values: this.generateDoc(values),
            isSubmitted,
            callback: () => this.props.closeModal(),
            object: this.props.detail
          })}
        </ModalFooter>
      </FormContainer>
    );
  }

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
