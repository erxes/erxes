import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { Column, Columns, Footer, Title } from 'modules/common/styles/chooser';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';

type Props = {
  data: any;
  onSelect: (datas: any[]) => void;
  datas: any[];
  title: string;
  renderName: (data: any) => void;
  renderForm: (props: { closeModal: () => void }) => any;
  limit?: number;
  add?: any;
  closeModal: () => void;
};

type State = {
  datas: any[];
  loadmore: boolean;
  searchValue: string;
};

class ItemChooser extends React.Component<Props, State> {
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

  componentWillReceiveProps(newProps) {
    const { datas, perPage } = newProps;

    this.setState({ loadmore: datas.length === perPage });
  }

  handleChange = (type, data) => {
    const { datas } = this.state;

    if (type === 'add') {
      if (this.props.limit && this.props.limit === datas.length) {
        return;
      }

      this.setState({ datas: [...datas, data] });
    } else {
      this.setState({ datas: datas.filter(item => item !== data) });
    }
  };

  renderRow(data, icon) {
    if (icon === 'add' && this.state.datas.some(e => e._id === data._id)) {
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
        <ul>
          {selectedDatas.map(data => this.renderRow(data, 'minus-circle'))}
        </ul>
      );
    }

    return <EmptyState text="No items added" icon="list-2" />;
  }

  render() {
    const { renderForm, datas, title, data, closeModal } = this.props;
    const selectedDatas = this.state.datas;

    const addTrigger = (
      <p>
        {__("Don't see the result you're looking for? ")}
        <span>{__(`Create a new ${title}`)}</span>
      </p>
    );

    return (
      <>
        <Columns>
          <Column>
            <ul>{datas.map(dataItem => this.renderRow(dataItem, 'add'))}</ul>
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
              <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
                Cancel
              </Button>
              <Button
                btnStyle="success"
                onClick={this.onSelect}
                icon="checked-1"
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

export default ItemChooser;
