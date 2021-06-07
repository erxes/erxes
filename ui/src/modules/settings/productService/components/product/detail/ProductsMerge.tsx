import Button from 'modules/common/components/Button';
import { SmallLoader } from 'modules/common/components/ButtonMutate';
import Icon from 'modules/common/components/Icon';
import { Column, Columns, Title } from 'modules/common/styles/chooser';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import { PRODUCT_INFO } from '../../../constants';
import { Info, InfoDetail, InfoTitle } from '../../../styles';
import { IProduct, IProductDoc } from '../../../types';

type Props = {
  objects: IProduct[];
  mergeProductLoading: boolean;
  save: (doc: { ids: string[]; data: any; callback: () => void }) => void;
  closeModal: () => void;
};

type State = {
  selectedValues: any;
};

class ProductsMerge extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedValues: {}
    };
  }

  save = (e: React.FormEvent) => {
    e.preventDefault();
    const { objects } = this.props;
    const selectedValues = { ...this.state.selectedValues };

    if (selectedValues.category) {
      selectedValues.categoryId = selectedValues.category._id;
    }

    if (selectedValues.vendor) {
      selectedValues.vendorId = selectedValues.vendor._id;
    }

    this.props.save({
      ids: objects.map(product => product._id),
      data: { ...selectedValues },
      callback: () => {
        this.props.closeModal();
      }
    });
  };

  handleChange = (type: string, key: string, value: string) => {
    const selectedValues = { ...this.state.selectedValues };

    if (type === 'plus-1') {
      selectedValues[key] = value;

      if (key === 'links') {
        const links = Object.assign(
          { ...this.state.selectedValues.links },
          value
        );
        selectedValues[key] = links;
      }
    } else {
      delete selectedValues[key];
    }

    this.setState({ selectedValues });
  };

  renderProduct = (product: IProductDoc, icon: string) => {
    const properties = PRODUCT_INFO.ALL;

    return (
      <React.Fragment>
        <Title>{product.name}</Title>
        <ul>
          {properties.map(info => {
            const key = info.field;

            if (!product[key]) {
              return null;
            }

            return this.renderProductProperties(key, product[key], icon);
          })}
        </ul>
      </React.Fragment>
    );
  };

  renderProductProperties(key: string, value: string, icon: string) {
    return (
      <li key={key} onClick={this.handleChange.bind(this, icon, key, value)}>
        {this.renderTitle(key)}
        {this.renderValue(key, value)}
        <Icon icon={icon} />
      </li>
    );
  }

  renderTitle(key: string) {
    const title = PRODUCT_INFO[key];

    return <InfoTitle>{title}:</InfoTitle>;
  }

  renderValue(field: string, value: any) {
    switch (field) {
      case 'category':
        return this.renderCategoryInfo(value);

      case 'vendor':
        return this.renderVendorInfo(value);

      default:
        return <InfoDetail>{value}</InfoDetail>;
    }
  }

  renderCategoryInfo(value) {
    return (
      <Info>
        <InfoTitle>{__('Name')}: </InfoTitle>
        <InfoDetail>{value.name}</InfoDetail>
      </Info>
    );
  }

  renderVendorInfo(value) {
    return (
      <Info>
        <InfoTitle>{__('Info')}: </InfoTitle>
        <InfoDetail>
          {value.primaryName ||
            value.primaryEmail ||
            value.primaryPhone ||
            value.code}
        </InfoDetail>
      </Info>
    );
  }

  render() {
    const { selectedValues } = this.state;
    const { objects, closeModal, mergeProductLoading } = this.props;

    const [product1, product2] = objects;

    return (
      <form onSubmit={this.save}>
        <Columns>
          <Column className="multiple">
            {this.renderProduct(product1, 'plus-1')}
          </Column>

          <Column className="multiple">
            {this.renderProduct(product2, 'plus-1')}
          </Column>

          <Column>{this.renderProduct(selectedValues, 'times')}</Column>
        </Columns>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            btnStyle="success"
            uppercase={false}
            icon={mergeProductLoading ? undefined : 'check-circle'}
            disabled={mergeProductLoading}
          >
            {mergeProductLoading && <SmallLoader />}
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default ProductsMerge;
