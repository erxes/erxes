import {
  Button,
  Form as CommonForm,
  ControlLabel,
  DateControl,
  FormControl,
  FormGroup,
  __
} from '@erxes/ui/src';
import { DateContainer, ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import {
  Card,
  CardContainer,
  CustomRangeContainer,
  EndDateContainer
} from '../../styles';
type Props = {
  detail?: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  sync: any;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      sync: props?.detail || {}
    };

    this.renderContent = this.renderContent.bind(this);
  }

  handleChange(name, value) {
    this.setState({ sync: { ...this.state.sync, [name]: value } });
  }

  generateDoc() {
    const { sync } = this.state;

    return { ...sync };
  }

  renderContent({ isSubmitted }: IFormProps) {
    const { renderButton, closeModal } = this.props;
    const { sync } = this.state;

    const onChange = e => {
      const { name, value } = e.currentTarget as HTMLInputElement;

      this.handleChange(name, value);
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Name')}</ControlLabel>
          <FormControl name="name" value={sync?.name} onChange={onChange} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            componentClass="textarea"
            name="description"
            value={sync?.description}
            onChange={onChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Sub domain')}</ControlLabel>
          <FormControl
            name="subdomain"
            value={sync?.subdomain}
            onChange={onChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('App Token')}</ControlLabel>
          <FormControl
            name="appToken"
            componentClass="textarea"
            value={sync?.appToken}
            onChange={onChange}
          />
        </FormGroup>
        <CustomRangeContainer>
          <DateContainer>
            <FormGroup>
              <ControlLabel>{__('Start Date')}</ControlLabel>
              <DateControl
                name="startDate"
                value={sync?.startDate}
                placeholder="select from date "
                onChange={e => this.handleChange('startDate', e)}
              />
            </FormGroup>
          </DateContainer>
          <EndDateContainer>
            <DateContainer>
              <FormGroup>
                <ControlLabel>{__('Expire Date')}</ControlLabel>
                <DateControl
                  name="expireDate"
                  value={sync?.expireDate}
                  placeholder="select to date "
                  onChange={e => this.handleChange('expireDate', e)}
                />
              </FormGroup>
            </DateContainer>
          </EndDateContainer>
        </CustomRangeContainer>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Close')}
          </Button>
          {renderButton({
            text: 'Synced Saas',
            values: this.generateDoc(),
            callback: closeModal,
            isSubmitted,
            object: this.props.detail
          })}
        </ModalFooter>
      </>
    );
  }

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
