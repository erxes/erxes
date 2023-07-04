import React from "react";
import Button from "../../../common/Button";
import EmptyState from "../../../common/form/EmptyState";
import { FormControl } from "../../../common/form";
import Icon from "../../../common/Icon";

import { __ } from "../../../../utils";
import {
  ActionTop,
  Column,
  Columns,
  Title,
  CenterContent
} from "../../../styles/products";
import { IProduct } from "../../../types";
import { ModalFooter } from "../../../common/form/styles";
import { ModalBody } from "react-bootstrap";

export type CommonProps = {
  products: IProduct[];
  perPage: number;
  selectedProducts: IProduct[];
  onSaveProducts: (products: IProduct[]) => void;
  search: (value: string, reload?: boolean) => void;
  closeModal: () => void;
};

type Props = {
  renderFilter?: () => any;
} & CommonProps;

type State = {
  selectedProducts: IProduct[];
  loadmore: boolean;
  searchValue: string;
};

class ProductChooser extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      selectedProducts: this.props.selectedProducts || [],
      loadmore: true,
      searchValue: ""
    };
  }

  componentWillReceiveProps(newProps) {
    const { products, perPage } = newProps;

    this.setState({
      loadmore: products.length === perPage && products.length > 0
    });
  }

  handleChange = (type, data) => {
    const { selectedProducts } = this.state;
    if (type === "plus-1") {
      this.setState({ selectedProducts: [...selectedProducts, data] });
    } else {
      this.setState({
        selectedProducts: selectedProducts.filter(item => item !== data)
      });
    }
  };

  search = e => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { search } = this.props;
    const value = e.target.value;

    this.timer = setTimeout(() => {
      search(value);
      this.setState({ searchValue: value });
    }, 500);
  };

  loadMore = () => {
    this.setState({ loadmore: false });
    this.props.search(this.state.searchValue, true);
  };

  renderRow(data: IProduct, icon) {
    if (
      icon === "plus-1" &&
      this.state.selectedProducts.some(e => e._id === data._id)
    ) {
      return null;
    }

    const onClick = () => {
      this.handleChange(icon, data);
    };

    return (
      <li key={Math.random()} onClick={onClick}>
        {data.name}
        <Icon icon={icon} />
      </li>
    );
  }

  renderSelected(selectedDatas) {
    if (selectedDatas.length) {
      return (
        <ul>{selectedDatas.map(data => this.renderRow(data, "times"))}</ul>
      );
    }

    return <EmptyState text="No items added" icon="list-ul" />;
  }

  content() {
    const { products } = this.props;

    if (!products.length) {
      return <EmptyState text="No matching items found" icon="list-ul" />;
    }

    return (
      <ul>
        {products.map(dataItem => this.renderRow(dataItem, "plus-1"))}
        {this.state.loadmore && (
          <CenterContent>
            <Button
              size="small"
              btnStyle="primary"
              onClick={this.loadMore}
              icon="angle-double-down"
            >
              Load More
            </Button>
          </CenterContent>
        )}
      </ul>
    );
  }

  renderSubFilter() {
    const { renderFilter } = this.props;
    if (!renderFilter) {
      return;
    }

    return renderFilter();
  }

  render() {
    const { closeModal, onSaveProducts } = this.props;
    const selectedDatas = this.state.selectedProducts;
    const onSaveBtn = () => {
      onSaveProducts(selectedDatas);
      closeModal();
    };
    return (
      <>
        <ModalBody>
          <Columns>
            <Column>
              <ActionTop>
                <FormControl
                  placeholder={__("Type to search")}
                  onChange={this.search}
                />
                {this.renderSubFilter()}
              </ActionTop>
              {this.content()}
            </Column>
            <Column lastChild={true}>
              <Title>
                {__("Products")}
                <span>({selectedDatas.length})</span>
              </Title>
              {this.renderSelected(selectedDatas)}
            </Column>
          </Columns>
          <ModalFooter>
            <Button
              icon="cancel-1"
              btnStyle="simple"
              onClick={() => closeModal()}
            >
              Cancel
            </Button>
            <Button btnStyle="primary" onClick={onSaveBtn}>
              Save
            </Button>
          </ModalFooter>
        </ModalBody>
      </>
    );
  }
}

export default ProductChooser;
