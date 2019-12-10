import EditForm from 'modules/boards/components/editForm/EditForm';
import Left from 'modules/boards/components/editForm/Left';
import Sidebar from 'modules/boards/components/editForm/Sidebar';
import Top from 'modules/boards/components/editForm/Top';
import { FlexContent, HeaderContentSmall } from 'modules/boards/styles/item';
import { IEditFormContent, IOptions } from 'modules/boards/types';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ISelectedOption } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import PortableDeals from 'modules/deals/components/PortableDeals';
import ProductSection from 'modules/deals/components/ProductSection';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import { Capitalize } from 'modules/settings/permissions/styles';
import { IProduct } from 'modules/settings/productService/types';
import PortableTasks from 'modules/tasks/components/PortableTasks';
import React from 'react';
import Select from 'react-select-plus';
import { ITicket, ITicketParams } from '../types';

type Props = {
  options: IOptions;
  item: ITicket;
  addItem: (doc: ITicketParams, callback: () => void, msg?: string) => void;
  saveItem: (doc: ITicketParams, callback?: (item) => void) => void;
  onUpdate: (item, prevStageId?: string) => void;
  removeItem: (itemId: string, callback: () => void) => void;
  beforePopupClose: () => void;
};

type State = {
  source: string;
  amount: any;
  products: IProduct[];
  productsData: any;
};

export default class TicketEditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const item = props.item;

    this.state = {
      source: item.source || '',
      amount: item.amount || {},
      productsData: item.products ? item.products.map(p => ({ ...p })) : [],
      // collecting data for ItemCounter component
      products: item.products ? item.products.map(p => p.product) : []
    };
  }

  renderAmount = () => {
    const { amount } = this.state;

    if (Object.keys(amount).length === 0) {
      return null;
    }

    return (
      <HeaderContentSmall>
        <ControlLabel>{__('Amount')}</ControlLabel>
        {Object.keys(amount).map(key => (
          <p key={key}>
            {amount[key].toLocaleString()} {key}
          </p>
        ))}
      </HeaderContentSmall>
    );
  };

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  saveProductsData = () => {
    const { productsData } = this.state;
    const { saveItem } = this.props;
    const products: IProduct[] = [];
    const amount: any = {};
    const filteredProductsData: any = [];

    productsData.forEach(data => {
      // products
      if (data.product) {
        if (data.currency) {
          // calculating item amount
          if (!amount[data.currency]) {
            amount[data.currency] = data.amount || 0;
          } else {
            amount[data.currency] += data.amount || 0;
          }
        }

        // collecting data for ItemCounter component
        products.push(data.product);

        data.productId = data.product._id;

        filteredProductsData.push(data);
      }
    });

    this.setState(
      { productsData: filteredProductsData, products, amount },
      () => {
        saveItem({ productsData: this.state.productsData }, updatedItem => {
          this.props.onUpdate(updatedItem);
        });
      }
    );
  };

  renderProductSection = () => {
    const { products, productsData } = this.state;

    const pDataChange = pData => this.onChangeField('productsData', pData);
    const prsChange = prs => this.onChangeField('products', prs);

    return (
      <ProductSection
        onChangeProductsData={pDataChange}
        onChangeProducts={prsChange}
        productsData={productsData}
        products={products}
        saveProductsData={this.saveProductsData}
      />
    );
  };

  renderSidebarFields = saveItem => {
    const { source } = this.state;

    const sourceValues = KIND_CHOICES.ALL_LIST.map(key => ({
      label: __(key),
      value: key
    }));

    sourceValues.push({
      label: __('other'),
      value: 'other'
    });

    const onSourceChange = (option: ISelectedOption) => {
      const value = option ? option.value : '';

      this.setState({ source: value }, () => {
        if (saveItem) {
          saveItem({ source: value });
        }
      });
    };

    const sourceValueRenderer = (option: ISelectedOption): React.ReactNode => (
      <Capitalize>{option.label}</Capitalize>
    );

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Source')}</ControlLabel>
          <Select
            placeholder={__('Select a source')}
            value={source}
            options={sourceValues}
            onChange={onSourceChange}
            optionRenderer={sourceValueRenderer}
            valueRenderer={sourceValueRenderer}
          />
        </FormGroup>
        {this.renderProductSection()}
      </>
    );
  };

  renderItems = () => {
    return (
      <>
        <PortableDeals mainType="ticket" mainTypeId={this.props.item._id} />
        <PortableTasks mainType="ticket" mainTypeId={this.props.item._id} />
      </>
    );
  };

  renderFormContent = ({
    state,
    copy,
    remove,
    saveItem,
    onChangeStage
  }: IEditFormContent) => {
    const { item, options, onUpdate } = this.props;

    const renderSidebar = () => this.renderSidebarFields(saveItem);

    return (
      <>
        <Top
          options={options}
          stageId={state.stageId}
          item={item}
          saveItem={saveItem}
          onChangeStage={onChangeStage}
          amount={this.renderAmount}
        />

        <FlexContent>
          <Left
            options={options}
            saveItem={saveItem}
            copyItem={copy}
            removeItem={remove}
            onUpdate={onUpdate}
            item={item}
          />

          <Sidebar
            options={options}
            item={item}
            sidebar={renderSidebar}
            saveItem={saveItem}
            renderItems={this.renderItems}
          />
        </FlexContent>
      </>
    );
  };

  render() {
    const extendedProps = {
      ...this.props,
      formContent: this.renderFormContent,
      extraFields: this.state
    };

    return <EditForm {...extendedProps} />;
  }
}
