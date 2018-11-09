import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { generateRandomColorCode } from 'modules/common/utils';
import { ContentSpace, FlexContent, FlexItem } from 'modules/layout/styles';
import { ITagDoc, ITagField } from 'modules/tags/types';
import * as React from 'react';
import styled from 'styled-components';

const TagWrapper = styled.div`
  padding: 20px;
`;

type Props = {
  fields: ITagField[];
  create: (params: { doc: ITagDoc }) => void;
  createTag: (value: boolean) => void;
};

type State = {
  name: string;
  type: string;
  colorCode: string;
};
class TagsForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      name: '',
      type: '',
      colorCode: generateRandomColorCode()
    };
  }

  handleChange = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  save = e => {
    e.preventDefault();

    const { name, type, colorCode } = this.state;

    const params = {
      doc: { name, type, colorCode }
    };

    this.props.create(params);
    this.props.createTag(false);
  };
  renderForm() {
    const onChangeName = e =>
      this.handleChange('name', (e.target as HTMLInputElement).value);
    const onChangeType = e =>
      this.handleChange('type', (e.target as HTMLInputElement).value);
    const onChangeColorCode = e =>
      this.handleChange('colorCode', (e.target as HTMLInputElement).value);

    return (
      <FlexContent>
        <FlexItem>
          <form onSubmit={this.save}>
            <FormGroup>
              <ControlLabel>{__('Name')}</ControlLabel>
              <FormControl
                type="text"
                required={true}
                value={this.state.name}
                onChange={onChangeName}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Type')}</ControlLabel>
              <FormControl
                type="text"
                required={true}
                value={this.state.type}
                onChange={onChangeType}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Color')}</ControlLabel>
              <FormControl
                type="color"
                required={true}
                value={this.state.type}
                onChange={onChangeColorCode}
              />
            </FormGroup>
            <Button
              size="small"
              btnStyle="success"
              onClick={this.save}
              icon="checked-1"
            >
              {__('Save')}
            </Button>
          </form>
        </FlexItem>
      </FlexContent>
    );
  }
  render() {
    return (
      <TagWrapper>
        <FlexContent>
          <FlexItem>
            <ContentSpace />
            {this.renderForm()}
          </FlexItem>
        </FlexContent>
      </TagWrapper>
    );
  }
}

export default TagsForm;
