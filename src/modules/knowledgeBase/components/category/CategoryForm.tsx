import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import * as React from 'react';
import Select from 'react-select-plus';
import { icons } from '../../icons.constant';
import { ICategory } from '../../types';

type Props = {
  currentTopicId: string;
  category: ICategory;
  save: (
    params: {
      doc: {
        doc: {
          title: string;
          description: string;
          icon: string;
          topicIds: string[];
        };
      };
    },
    callback: () => void,
    category: ICategory
  ) => void;

  closeModal: () => void;
};

type State = {
  selectedIcon: string;
};

class CategoryForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedIcon: this.getSelectedIcon()
    };
  }

  save = e => {
    e.preventDefault();

    this.props.save(
      this.generateDoc(),
      () => this.props.closeModal(),
      this.props.category
    );
  };

  getSelectedIcon() {
    const { category } = this.props;

    return category ? category.icon : '';
  }

  onChangeIcon = obj => {
    this.setState({
      selectedIcon: obj ? obj.value : ''
    });
  };

  renderOption = option => {
    return (
      <div className="icon-option">
        <Icon icon={option.value} />
        {option.label}
      </div>
    );
  };

  generateDoc() {
    const { category, currentTopicId } = this.props;

    return {
      ...category,
      doc: {
        doc: {
          title: (document.getElementById(
            'knowledgebase-category-title'
          ) as HTMLInputElement).value,
          description: (document.getElementById(
            'knowledgebase-category-description'
          ) as HTMLInputElement).value,
          icon: this.state.selectedIcon,
          topicIds: [currentTopicId]
        }
      }
    };
  }

  renderContent(category = { title: '', description: '' }) {
    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <FormControl
            id="knowledgebase-category-title"
            type="text"
            defaultValue={category.title}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            id="knowledgebase-category-description"
            type="text"
            defaultValue={category.description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Icon</ControlLabel>
          <Select
            name="form-field-name"
            value={this.state.selectedIcon}
            options={icons}
            onChange={this.onChangeIcon}
            optionRenderer={this.renderOption}
            valueRenderer={this.renderOption}
          />
        </FormGroup>
      </React.Fragment>
    );
  }

  render() {
    return (
      <form onSubmit={this.save}>
        {this.renderContent(
          this.props.category || { title: '', description: '' }
        )}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default CategoryForm;
