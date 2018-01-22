import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  Button,
  Icon,
  FormControl,
  ModalTrigger,
  EmptyState
} from 'modules/common/components';
import { Footer, LoadMore, Title, Columns, Column } from '../../styles';

const propTypes = {
  data: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
  search: PropTypes.func.isRequired,
  datas: PropTypes.array.isRequired,
  form: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  renderName: PropTypes.func.isRequired,
  perPage: PropTypes.number.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class CommonAssociate extends Component {
  constructor(props) {
    super(props);
    const datas = this.props.data.datas || [];

    this.state = {
      datas,
      loadmore: true,
      searchValue: ''
    };

    this.save = this.save.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.search = this.search.bind(this);
    this.loadMore = this.loadMore.bind(this);
  }

  save() {
    const { datas } = this.state;
    const ids = [];

    datas.forEach(data => {
      ids.push(data._id.toString());
    });

    this.props.save(ids);
    this.context.closeModal();
  }

  componentWillUnmount() {
    this.props.search('');
  }

  componentWillReceiveProps(newProps) {
    const { datas, perPage } = newProps;

    this.setState({ loadmore: datas.length === perPage });
  }

  handleChange(type, data) {
    const { datas } = this.state;

    if (type === 'plus') {
      this.setState({
        datas: [...datas, data]
      });
    } else {
      this.setState({
        datas: datas.filter(item => item !== data)
      });
    }
  }

  search(e) {
    if (this.timer) clearTimeout(this.timer);
    const { search } = this.props;
    const value = e.target.value;

    this.timer = setTimeout(() => {
      search(value);
      this.setState({ searchValue: value });
    }, 500);
  }

  loadMore() {
    this.setState({ loadmore: false });
    this.props.search(this.state.searchValue, true);
  }

  renderRow(data, icon) {
    if (icon === 'plus' && this.state.datas.some(e => e._id === data._id)) {
      return null;
    }

    return (
      <li key={data._id} onClick={() => this.handleChange(icon, data)}>
        {this.props.renderName(data)}
        <Icon icon={icon} />
      </li>
    );
  }

  render() {
    const { datas, form, title, data } = this.props;
    const selectedDatas = this.state.datas;

    const addTrigger = (
      <p>
        Don&apos;t see the result you&apos;re looking for? &ensp;
        <a>Create a new {title}</a>
      </p>
    );

    return (
      <div>
        <Columns>
          <Column>
            <FormControl
              placeholder="Type to search"
              onChange={e => this.search(e)}
            />
            <ul>
              {datas.map(data => this.renderRow(data, 'plus'))}
              {this.state.loadmore && (
                <LoadMore>
                  <Button
                    size="small"
                    btnStyle="primary"
                    onClick={this.loadMore}
                    icon="checkmark"
                  >
                    Load More
                  </Button>
                </LoadMore>
              )}
            </ul>
          </Column>
          <Column>
            <Title>
              {data.name}&apos;s {title}
              <span>({selectedDatas.length})</span>
            </Title>
            {!selectedDatas.length && (
              <EmptyState
                text="No items added"
                size="full"
                icon="ios-list-outline"
              />
            )}
            <ul>{selectedDatas.map(data => this.renderRow(data, 'close'))}</ul>
          </Column>
        </Columns>
        <Modal.Footer>
          <Footer>
            <ModalTrigger title={`New ${title}`} trigger={addTrigger}>
              {form}
            </ModalTrigger>
            <div>
              <Button
                btnStyle="simple"
                onClick={() => this.context.closeModal()}
                icon="close"
              >
                Cancel
              </Button>
              <Button btnStyle="success" onClick={this.save} icon="checkmark">
                Save
              </Button>
            </div>
          </Footer>
        </Modal.Footer>
      </div>
    );
  }
}

CommonAssociate.propTypes = propTypes;
CommonAssociate.contextTypes = contextTypes;

export default CommonAssociate;
