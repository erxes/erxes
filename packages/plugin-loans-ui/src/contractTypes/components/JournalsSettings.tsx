import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  MainStyleTitle as Title,
  Wrapper
} from '@erxes/ui/src';
import { dimensions } from '@erxes/ui/src';
import styled from 'styled-components';

import React from 'react';
import { JOURNALS_KEY_LABELS } from '../constants';
import { IContractTypeDetail } from '../types';
import { __ } from 'coreui/utils';

const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  max-width: 640px;
  margin: 0 auto;
`;

const ContentWrapper = styled.div`
  background: white;
`;

type Props = {
  contractType: IContractTypeDetail;
  saveItem: (doc: IContractTypeDetail, callback?: (item) => void) => void;
};

type State = {
  currentMap: any;
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentMap: this.props.contractType.config || {}
    };
  }

  save = e => {
    e.preventDefault();
    const { contractType } = this.props;
    const { currentMap } = this.state;

    this.props.saveItem({ ...contractType, config: currentMap });
  };

  onChangeConfig = (code: string, value) => {
    const { currentMap } = this.state;

    currentMap[code] = value;

    this.setState({ currentMap });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  onChangeCheckbox = (code: string, e) => {
    this.onChangeConfig(code, e.target.checked);
  };

  renderItem = (key: string, description?: string, controlProps?: any) => {
    const { currentMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          {...controlProps}
          defaultValue={currentMap[key]}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  renderCheckbox = (key: string, description?: string) => {
    const { currentMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{JOURNALS_KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          checked={currentMap[key]}
          onChange={this.onChangeCheckbox.bind(this, key)}
          componentClass="checkbox"
        />
      </FormGroup>
    );
  };

  render() {
    const actionButtons = (
      <Button
        btnStyle="primary"
        onClick={this.save}
        icon="check-circle"
        uppercase={false}
      >
        {__('Save')}
      </Button>
    );

    const content = (
      <ContentBox>
        <CollapseContent title={__('Loan payment')}>
          {this.renderItem('transAccount')}
          {this.renderItem('normalAccount')}
          {this.renderItem('expiredAccount')}
          {this.renderItem('doubtfulAccount')}
          {this.renderItem('negativeAccount')}
          {this.renderItem('badAccount')}
        </CollapseContent>

        <CollapseContent title={__('Interest')}>
          {this.renderItem('interestAccount')}
          {this.renderCheckbox('extraInterestHasVat')}
          {this.renderCheckbox('extraInterestHasCitytax')}
          {this.renderCheckbox('extraInterestIsEbarimt')}
        </CollapseContent>

        <CollapseContent title={__('Insurance')}>
          {this.renderItem('insuranceAccount')}
        </CollapseContent>

        <CollapseContent title={__('Undue')}>
          {this.renderItem('undueAccount')}
          {this.renderCheckbox('undueHasVat')}
          {this.renderCheckbox('undueHasCitytax')}
          {this.renderCheckbox('undueIsEbarimt')}
        </CollapseContent>

        <CollapseContent title={__('Other')}>
          {this.renderItem('debtAccount')}
          {this.renderItem('otherReceivable')}
          {this.renderItem('feeIncome')}
        </CollapseContent>
        <CollapseContent title={__('Classification')}>
          {this.renderItem('normalExpirationDay', 'Normal /Expiration Day/', {
            type: 'number'
          })}
          {this.renderItem('expiredExpirationDay', 'Expired /Expiration Day/', {
            type: 'number'
          })}
          {this.renderItem('doubtExpirationDay', 'Doubt /Expiration Day/', {
            type: 'number'
          })}
          {this.renderItem(
            'negativeExpirationDay',
            'Negative /Expiration Day/',
            {
              type: 'number'
            }
          )}
          {this.renderItem('badExpirationDay', 'Bad /Expiration Day/', {
            type: 'number'
          })}
        </CollapseContent>
        <CollapseContent title={__('Range config')}>
          {this.renderItem('minInterest', 'Min interest /Month/', {
            type: 'number'
          })}
          {this.renderItem('maxInterest', 'Max interest /Month/', {
            type: 'number'
          })}
          {this.renderItem('defaultInterest', 'Default interest /Month/', {
            type: 'number'
          })}
          {this.renderItem('minTenor', 'Min tenor /Month/', {
            type: 'number'
          })}
          {this.renderItem('maxTenor', 'Max tenor /Month/', {
            type: 'number'
          })}
          {this.renderItem('minAmount', 'Min amount /Month/', {
            type: 'number',
            useNumberFormat: true
          })}
          {this.renderItem('maxAmount', 'Max amount /Month/', {
            type: 'number',
            useNumberFormat: true
          })}
        </CollapseContent>
      </ContentBox>
    );

    return (
      <ContentWrapper>
        <Wrapper.ActionBar
          left={<Title>{__('Journals configs')}</Title>}
          right={actionButtons}
        />
        {content}
      </ContentWrapper>
    );
  }
}

export default GeneralSettings;
