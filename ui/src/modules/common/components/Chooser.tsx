import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __ } from 'modules/common/utils';
import { ICompany } from 'modules/companies/types';
import { ICustomer } from 'modules/customers/types';
import React from 'react';
import { ActionTop, Column, Columns, Footer, Title } from '../styles/chooser';
import { CenterContent, ModalFooter } from '../styles/main';

export type CommonProps = {
  data: any;
  search: (value: string, reload?: boolean) => void;
  datas: any[];
  title: string;
  renderName: (data: any) => void;
  renderForm: (props: { closeModal: () => void }) => any;
  perPage: number;
  clearState: () => void;
  limit?: number;
  newItem?: string | ICompany | ICustomer;
  resetAssociatedItem?: () => void;
  closeModal: () => void;
  onSelect: (datas: any[]) => void;
};

type Props = {
  renderFilter?: () => any;
} & CommonProps;

type State = {
  datas: any[];
  loadmore: boolean;
  searchValue: string;
};

class CommonChooser extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    const datas = this.props.data.datas || [];

    this.state = {
      datas,
      loadmore: true,
      searchValue: ''
    };
  }

  onSelect = () => {
    this.props.onSelect(this.state.datas);
    this.props.closeModal();
  };

  componentWillUnmount() {
    this.props.clearState();
  }

  componentWillReceiveProps(newProps) {
    const { datas, perPage, newItem } = newProps;

    this.setState({ loadmore: datas.length === perPage && datas.length > 0 });

    const { resetAssociatedItem } = this.props;

    if (newItem) {
      this.setState({ datas: [...this.state.datas, newItem] }, () => {
        if (resetAssociatedItem) {
          resetAssociatedItem();
        }
      });
    }
  }

  handleChange = (type, data) => {
    const { datas } = this.state;

    if (type === 'plus-1') {
      if (this.props.limit && this.props.limit === datas.length) {
        return;
      }

      this.setState({ datas: [...datas, data] });
    } else {
      this.setState({ datas: datas.filter(item => item !== data) });
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

  renderRow(data, icon) {
    if (icon === 'plus-1' && this.state.datas.some(e => e._id === data._id)) {
      return null;
    }

    const onClick = () => this.handleChange(icon, data);

    return (
      <li key={data._id} onClick={onClick}>
        {this.props.renderName(data)}
        <Icon icon={icon} />
      </li>
    );
  }

  renderSelected(selectedDatas) {
    if (selectedDatas.length) {
      return (
        <ul>{selectedDatas.map(data => this.renderRow(data, 'times'))}</ul>
      );
    }

    return <EmptyState text="No items added" icon="list-ul" />;
  }

  content() {
    const { datas } = this.props;

    if (datas.length === 0) {
      return <EmptyState text="No matching items found" icon="list-ul" />;
    }

    return (
      <ul>
        {datas.map(dataItem => this.renderRow(dataItem, 'plus-1'))}
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
    const { renderForm, title, data, closeModal } = this.props;
    const selectedDatas = this.state.datas;

    const addTrigger = (
      <p>
        {__("Don't see the result you're looking for?")}
        <span>{__(`Create a new ${title}`)}</span>
      </p>
    );

    return (
      <>
        <Columns>
          <Column>
            <ActionTop>
              <FormControl
                placeholder={__('Type to search')}
                onChange={this.search}
              />
              {this.renderSubFilter()}
            </ActionTop>
            {this.content()}
          </Column>
          <Column>
            <Title>
              {data.name}
              &apos;s {title}
              <span>({selectedDatas.length})</span>
            </Title>
            {this.renderSelected(selectedDatas)}
          </Column>
        </Columns>
        <ModalFooter>
          <Footer>
            <ModalTrigger
              title={`New ${title}`}
              trigger={addTrigger}
              size="lg"
              content={renderForm}
            />
            <div>
              <Button
                btnStyle="simple"
                uppercase={false}
                onClick={closeModal}
                icon="times-circle"
              >
                Cancel
              </Button>
              <Button
                btnStyle="success"
                onClick={this.onSelect}
                icon="check-circle"
                uppercase={false}
              >
                Select
              </Button>
            </div>
          </Footer>
        </ModalFooter>
      </>
    );
  }
}

export default CommonChooser;
