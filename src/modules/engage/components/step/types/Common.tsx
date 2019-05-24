import { FormControl, Icon } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { CustomerCounts, RadioContainer } from 'modules/engage/styles';
import {
  BrandAdd,
  SegmentAdd,
  TagAdd,
  TargetCount
} from 'modules/engage/types';
import { ISegment, ISegmentDoc, ISegmentField } from 'modules/segments/types';
import { IBrand } from 'modules/settings/brands/types';
import { ITag } from 'modules/tags/types';
import * as React from 'react';
import { Targets } from '../..';

type Props = {
  name: string;
  label: string;
  targetIds: string[];
  messageType: string;
  targets: ISegment[] | IBrand[] | ITag[];
  save: BrandAdd | SegmentAdd | TagAdd;
  targetCount: TargetCount;
  Form: any;
  formProps?: {
    count?: (segment: ISegmentDoc) => void;
    headSegments?: ISegment[];
    segmentFields?: ISegmentField[];
  };
  customersCount: (ids: string[]) => number;
  onChange: (
    name: 'brandIds' | 'tagIds' | 'segmentIds',
    value: string[]
  ) => void;
  content: (
    {
      actionSelector,
      selectedComponent,
      customerCounts
    }: {
      actionSelector: React.ReactNode;
      selectedComponent;
      customerCounts: React.ReactNode;
    }
  ) => React.ReactNode;
};

type State = {
  targetIds: string[];
  show: boolean;
};

class Common extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      targetIds: props.targetIds || [],
      show: false
    };
  }

  toggleForm = () => {
    this.setState(s => ({ show: !s.show }));
  };

  showForm = (show: boolean) => {
    this.setState({ show });
  };

  onChangeStep = (name, targetIds: string[]) => {
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

  renderRadioControl = ({ title, ...args }) => {
    const { label } = this.props;

    return (
      <FormControl
        {...args}
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
      Form,
      formProps,
      save
    } = this.props;

    if (this.state.show) {
      return <Form {...formProps} create={save} showForm={this.showForm} />;
    }

    return (
      <Targets
        name={name}
        targets={targets}
        messageType={messageType}
        targetCount={targetCount}
        defaultValues={targetIds}
        onChangeStep={this.onChangeStep}
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
