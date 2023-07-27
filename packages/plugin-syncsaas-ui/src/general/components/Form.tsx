import {
  BarItems,
  Button,
  Form as CommonForm,
  ControlLabel,
  DateControl,
  FormControl,
  FormGroup,
  PageHeader,
  Step,
  Steps,
  __
} from '@erxes/ui/src';
import { StepWrapper } from '@erxes/ui/src/components/step/styles';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import { Link } from 'react-router-dom';
import SelectBoard from '../../common/BoardSelect';
import { SelectCardType } from '../../common/utils';
import {
  CustomRangeContainer,
  EndDateContainer,
  Padding,
  StepperContainer
} from '../../styles';

type Props = {
  detail?: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  saveConfig: (_id: string, config: any) => void;
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

  renderConfig() {
    const { sync } = this.state;

    const { config } = sync || [];

    const handleSelect = (name, value) => {
      this.setState({
        sync: { ...sync, config: { ...config, [name]: value } }
      });
    };

    return (
      <>
        <SelectCardType
          handleSelect={({ value }) => handleSelect('type', value)}
          params={config}
        />
        {config?.type && (
          <SelectBoard
            type={config?.type}
            params={config}
            onSelect={handleSelect}
            subdomain={sync.subdomain}
            appToken={sync.appToken}
          />
        )}
      </>
    );
  }

  renderContent({ isSubmitted }: IFormProps) {
    const { renderButton, closeModal, saveConfig } = this.props;
    const { sync } = this.state;

    const onChange = e => {
      const { name, value } = e.currentTarget as HTMLInputElement;

      this.handleChange(name, value);
    };

    return (
      <StepWrapper>
        <Steps>
          <Step
            title="Main"
            img="/images/icons/erxes-12.svg"
            additionalButton={renderButton({
              text: 'Synced Saas',
              values: this.generateDoc(),
              callback: closeModal,
              isSubmitted,
              object: this.props.detail
            })}
          >
            <Padding>
              <FormGroup>
                <ControlLabel>{__('Name')}</ControlLabel>
                <FormControl
                  name="name"
                  value={sync?.name}
                  onChange={onChange}
                />
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
            </Padding>
          </Step>
          {this.props?.detail && (
            <Step
              title="Config"
              img="/images/icons/erxes-30.png"
              additionalButton={
                <Button
                  btnStyle="success"
                  onClick={() => saveConfig(sync._id, sync.config)}
                >
                  {'Save config'}
                </Button>
              }
            >
              <Padding>{this.renderConfig()}</Padding>
            </Step>
          )}
        </Steps>
      </StepWrapper>
    );
  }

  render() {
    return (
      <StepperContainer>
        <PageHeader>
          <BarItems>
            <Link to={`/settings/sync-saas`}>
              <Button icon="leftarrow-3" btnStyle="link">
                {__('Back')}
              </Button>
            </Link>
          </BarItems>
        </PageHeader>
        <CommonForm renderContent={this.renderContent} />
      </StepperContainer>
    );
  }
}

export default Form;
