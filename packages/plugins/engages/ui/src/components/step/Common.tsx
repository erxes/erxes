import FormControl from 'erxes-ui/lib/components/form/Control';
import Icon from 'erxes-ui/lib/components/Icon';
import { IButtonMutateProps } from 'erxes-ui/lib/types';
import { __ } from 'erxes-ui/lib/utils';
import { CustomerCounts, RadioContainer } from '../../styles';
import { TargetCount } from '../../types';
import React from 'react';
import Targets from '../Targets';

type Props<Target, OnSubmit> = {
  name: string;
  label: string;
  targetIds: string[];
  messageType: string;
  targets: Target[];
  onSubmit?: OnSubmit;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
  targetCount: TargetCount;
  Form: any;
  formProps?: {
    count?: (segment: any) => void;
    tags?: any[];
    segmentType?: string;
    afterSave?: () => void;
  };
  customersCount: (ids: string[]) => number;
  onChange: (name: string, value: string[]) => void;
  content: ({
    actionSelector,
    selectedComponent,
    customerCounts
  }: {
    actionSelector: React.ReactNode;
    selectedComponent: React.ReactNode;
    customerCounts: React.ReactNode;
  }) => React.ReactNode;
  icons?: React.ReactNode[];
};

type State = {
  targetIds: string[];
  show: boolean;
};

class Common<Target, OnSubmit> extends React.Component<
  Props<Target, OnSubmit>,
  State
> {
  constructor(props) {
    super(props);

    this.state = {
      targetIds: props.targetIds || [],
      show: false
    };
  }

  toggleForm = () => {
    const { formProps } = this.props;

    if (formProps && formProps.afterSave) {
      formProps.afterSave();
    }

    this.setState(s => ({ show: !s.show }));
  };

  onChangeStep = (name: string, targetIds: string[]) => {
    this.setState({ targetIds }, () => {
      this.props.onChange(name, targetIds);
    });
  };

  renderCounts() {
    const { targetIds } = this.state;

    return (
      <CustomerCounts>
        <Icon icon="users" size={50} />
        <p>
          {this.props.customersCount(targetIds)} {__('customers')}
        </p>
      </CustomerCounts>
    );
  }

  renderRadioControl = ({
    title,
    checked
  }: {
    title: string;
    checked: boolean;
  }) => {
    const { label } = this.props;

    return (
      <FormControl
        checked={checked}
        name={label}
        onChange={this.toggleForm}
        value={this.state.show}
        componentClass="radio"
      >
        {title}
      </FormControl>
    );
  };

  renderActionSelector() {
    const { show } = this.state;
    const { messageType } = this.props;

    return (
      <RadioContainer>
        {this.renderRadioControl({
          checked: show === false,
          title: __(`Choose a ${messageType}`)
        })}

        {this.renderRadioControl({
          checked: show === true,
          title: __(`Create a ${messageType}`)
        })}
      </RadioContainer>
    );
  }

  renderSelectedComponent() {
    const {
      targets,
      messageType,
      targetCount,
      targetIds,
      name,
      renderButton,
      Form,
      formProps,
      onSubmit,
      icons
    } = this.props;

    if (this.state.show) {
      return (
        <Form
          {...formProps}
          {...this.props}
          renderButton={renderButton}
          save={onSubmit}
          afterSave={this.toggleForm}
        />
      );
    }

    return (
      <Targets<Target>
        name={name}
        targets={targets}
        messageType={messageType}
        targetCount={targetCount}
        defaultValues={targetIds}
        onChangeStep={this.onChangeStep}
        icons={icons}
      />
    );
  }

  render() {
    const actionSelector = this.renderActionSelector();
    const selectedComponent = this.renderSelectedComponent();
    const customerCounts = this.renderCounts();

    return this.props.content({
      actionSelector,
      selectedComponent,
      customerCounts
    });
  }
}

export default Common;
