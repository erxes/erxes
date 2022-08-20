import {
  __,
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

  renderItem = (key: string, description?: string) => {
    const { currentMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{JOURNALS_KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
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
        Save
      </Button>
    );

    const content = (
      <ContentBox>
        <CollapseContent title="Үндсэн зээл">
          {this.renderItem('receivable')}
          {this.renderItem('temp')}
          {this.renderItem('giving')}
          {this.renderItem('tempDebt')}

          {this.renderItem('mainUserEmail')}
          {this.renderCheckbox('mainHasVat')}
          {this.renderCheckbox('mainHasCitytax')}
          {this.renderCheckbox('mainIsEbarimt')}
        </CollapseContent>

        <CollapseContent title="Хүү">
          {this.renderItem('interestReceivable')}
          {this.renderItem('interestGiving')}
          {this.renderItem('interestCalcedReceive')}
          {this.renderItem('interestIncome')}

          {this.renderItem('extraInterestUserEmail')}
          {this.renderCheckbox('extraInterestHasVat')}
          {this.renderCheckbox('extraInterestHasCitytax')}
          {this.renderCheckbox('extraInterestIsEbarimt')}
        </CollapseContent>

        <CollapseContent title="Даатгал">
          {this.renderItem('insuranceReceivable')}
          {this.renderItem('insuranceGiving')}
        </CollapseContent>

        <CollapseContent title="Алданги">
          {this.renderItem('undueStock')}
          {this.renderItem('undueUserEmail')}
          {this.renderCheckbox('undueHasVat')}
          {this.renderCheckbox('undueHasCitytax')}
          {this.renderCheckbox('undueIsEbarimt')}
        </CollapseContent>

        <CollapseContent title="Бусад">
          {this.renderItem('otherReceivable')}
          {this.renderItem('feeIncome')}
          {this.renderItem('defaultCustomer')}
          {this.renderItem('userEmail')}
          {this.renderItem('repaymentTemp')}
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
