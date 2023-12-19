import {
  Button,
  Chooser,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  ModalTrigger,
  MainStyleTitle as Title,
  Wrapper
} from '@erxes/ui/src';
import { dimensions } from '@erxes/ui/src';
import styled from 'styled-components';

import React from 'react';
import { JOURNALS_KEY_LABELS } from '../constants';
import { IContractTypeDetail } from '../types';
import { __ } from 'coreui/utils';
import ProductChooser from '@erxes/ui-products/src/containers/ProductChooser';
import { CollateralButton } from '../../contracts/styles';
import { ScrollWrapper } from '@erxes/ui/src/styles/main';

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
        <ControlLabel>{__(JOURNALS_KEY_LABELS[key])}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          {...controlProps}
          value={currentMap[key]}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  renderCheckbox = (key: string, description?: string, backElement?: any) => {
    const { currentMap } = this.state;

    return (
      <FormGroup>
        {backElement && (
          <div style={{ display: 'inline-block', marginRight: '5px' }}>
            {backElement}
          </div>
        )}
        <ControlLabel>{__(JOURNALS_KEY_LABELS[key])}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          checked={currentMap[key]}
          onChange={this.onChangeCheckbox.bind(this, key)}
          componentClass="checkbox"
        />
      </FormGroup>
    );
  };

  renderProductTrigger(collateral?: any) {
    let content = (
      <div>
        {__('Choose E-Barimt Product')} <Icon icon="plus-circle" />
      </div>
    );

    // if collateral selected
    if (collateral) {
      content = (
        <div>
          {collateral.name} <Icon icon="pen-1" />
        </div>
      );
    }

    return <CollateralButton>{content}</CollateralButton>;
  }

  renderProductModal(key: string) {
    const { currentMap } = this.state;
    const product = currentMap[key];

    const productOnChange = (products: any[]) => {
      const product = products && products.length === 1 ? products[0] : null;

      if (product) {
        this.onChangeConfig(key, product);
      }
    };

    const content = props => (
      <ProductChooser
        {...props}
        onSelect={productOnChange}
        data={{
          name: 'Product',
          products: product ? [product] : []
        }}
        limit={1}
        chooserComponent={Chooser}
      />
    );

    return (
      <ModalTrigger
        title="Choose product"
        trigger={this.renderProductTrigger(product)}
        size="lg"
        content={content}
      />
    );
  }

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
      <ScrollWrapper>
        <ContentBox>
          <CollapseContent title={__('Данс')}>
            {this.renderItem('transAccount')}
            {this.renderItem('savingAccount')}
            {this.renderItem('interestAccount')}
            {this.renderItem('storedInterestAccount')}
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
            {this.renderItem('minDuration', 'Min duration /Month/', {
              type: 'number'
            })}
            {this.renderItem('maxDuration', 'Max duration /Month/', {
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
          <CollapseContent title={__('Store interest config')}>
            {this.renderItem('Store interest time', 'Store interest time', {
              type: 'time'
            })}
          </CollapseContent>
        </ContentBox>
      </ScrollWrapper>
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
