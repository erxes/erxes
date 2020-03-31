import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import { LEAD_CHOICES } from 'modules/customers/constants';
import { LeadStateWrapper, StateItem } from 'modules/customers/styles';
import { ICustomer } from 'modules/customers/types';
import React from 'react';

type IProps = {
  customer: ICustomer;
  saveState: (state: string) => void;
  changeCustomerState: (value: string) => void;
};

class LeadState extends React.Component<IProps, { currentState: string }> {
  constructor(props: IProps) {
    super(props);

    const { customer } = props;

    this.state = { currentState: customer.leadStatus || 'new' };
  }

  findIndex = () => {
    const { currentState } = this.state;

    let i = 0;

    LEAD_CHOICES.forEach(({ value }, index) => {
      if (value === currentState) {
        i = index;
      }
    });

    return i;
  };

  convertToCustomer = () => {
    this.props.changeCustomerState('customer');
  };

  render() {
    const { customer, saveState } = this.props;

    if (customer.state !== 'lead') {
      return null;
    }

    return (
      <LeadStateWrapper>
        {LEAD_CHOICES.map(({ value, label }, index) => {
          const onClick = () => {
            this.setState({ currentState: value });

            saveState(value);
          };

          const currentIndex = this.findIndex();

          return (
            <StateItem
              key={index}
              past={index < currentIndex}
              active={index === currentIndex}
              onClick={onClick}
            >
              <div>
                {index < currentIndex && <Icon icon="check-1" size={16} />}
                {label}
              </div>
            </StateItem>
          );
        })}
        <Button
          icon="check-circle"
          btnStyle="danger"
          onClick={this.convertToCustomer}
        >
          Mark as Complete
        </Button>
      </LeadStateWrapper>
    );
  }
}

export default LeadState;
