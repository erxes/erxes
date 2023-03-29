import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { FlexPad } from '@erxes/ui/src/components/step/styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IPageDoc } from '../../types';
import { PageFormContainer } from './styles';
import React from 'react';
import { SubTitle } from '../sites/styles';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  page: IPageDoc;
  onCancel: (settingsObject: any, type: string) => void;
  remove: (_id: string, afterSave?: any) => void;
  save: (pageName: string, pageDescription: string, pageId: string) => void;
};

type State = {
  name: string;
  description: string;
  slug: string;
};

class PageForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const page = props.page || {};

    this.state = {
      name: page.name,
      description: page.description,
      slug: page.slug || ''
    };
  }

  componentDidUpdate(prevProps) {
    const { page } = this.props;

    if (prevProps.page !== page) {
      this.setState({
        name: page.name,
        description: page.description
      });
    }
  }

  onChange = (type: string, value: any) => {
    this.setState({ [type]: value } as any);
  };

  save = () => {
    const { save, page } = this.props;

    save(this.state.name, this.state.description, page._id || '');
  };

  renderButtons = () => {
    const { remove, page, onCancel } = this.props;

    const cancelButton = (
      <Button
        btnStyle="simple"
        icon="times-circle"
        onClick={() => onCancel(null, '')}
      >
        Cancel
      </Button>
    );

    const deleteButton = (
      <Button
        btnStyle="danger"
        icon="trash-alt"
        onClick={() => remove(page._id, onCancel(null, ''))}
      >
        Delete
      </Button>
    );

    return (
      <Button.Group>
        {page.name && deleteButton}
        {cancelButton}

        <Button btnStyle="success" icon={'check-circle'} onClick={this.save}>
          Save
        </Button>
      </Button.Group>
    );
  };

  render() {
    const { description, name, slug } = this.state;

    return (
      <PageFormContainer className="gjs-one-bg gjs-two-color">
        <SubTitle flexBetween={true}>
          {__('Page Settings')} {this.renderButtons()}
        </SubTitle>
        <FlexPad direction="column" overflow="auto">
          <FormGroup>
            <ControlLabel>Name:</ControlLabel>
            <FormControl
              placeholder="Enter a name"
              onChange={(e: any) => this.onChange('name', e.target.value)}
              value={name}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Description:</ControlLabel>
            <FormControl
              placeholder="Enter a description"
              onChange={(e: any) =>
                this.onChange('description', e.target.value)
              }
              value={description}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Slug:</ControlLabel>
            <FormControl
              placeholder="Enter a page slug"
              onChange={(e: any) => this.onChange('slug', e.target.value)}
              value={slug}
            />
          </FormGroup>
        </FlexPad>
      </PageFormContainer>
    );
  }
}

export default PageForm;
