import 'grapesjs/dist/css/grapes.min.css';

import { FlexItem, FlexPad } from '@erxes/ui/src/components/step/styles';
import { IContentTypeDoc, IPageDoc } from '../../types';
import { __, uploadHandler } from '@erxes/ui/src/utils';

import Alert from '@erxes/ui/src/utils/Alert';
import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ControlWrapper } from '@erxes/ui/src/components/step/styles';
import { EditorContainer } from '@erxes/ui-engage/src/styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import GrapesJS from 'grapesjs';
import { Indicator } from '@erxes/ui/src/components/step/styles';
import { Link } from 'react-router-dom';
import React from 'react';
import SelectSite from '../../containers/sites/SelectSite';
import Step from '@erxes/ui/src/components/step/Step';
import { StepWrapper } from '@erxes/ui/src/components/step/styles';
import Steps from '@erxes/ui/src/components/step/Steps';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import customPlugins from './customPlugins';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import { readFile } from '@erxes/ui/src/utils/core';

type Props = {
  page?: IPageDoc;
  save: (
    name: string,
    description: string,
    siteId: string,
    html: string,
    css: string
  ) => void;
};

type State = {
  name: string;
  description: string;
  siteId: string;
};

class PageForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const page = props.page || {};

    this.state = {
      name: page.name,
      description: page.description,
      siteId: page.siteId
    };
  }

  onChange = (type: string, value: any) => {
    this.setState({ [type]: value } as any);
  };

  onSelectSite = (value: any) => {
    this.setState({ siteId: value });
  };

  save = () => {
    // const e = this.grapes;
    const e = {} as any;

    this.props.save(
      this.state.name,
      this.state.description,
      this.state.siteId,
      e.getHtml(),
      e.getCss({ keepUnusedStyles: true })
    );
  };

  renderPageContent() {
    const imagePath = '/images/icons/erxes-12.svg';
    const { description, name, siteId } = this.state;

    return (
      // <Step img={imagePath} title="Manage web builder page" noButton={true}>
      <FlexItem>
        <FlexPad direction="column" overflow="auto">
          <FormGroup>
            <ControlLabel>Name:</ControlLabel>
            <FormControl
              placeholder="Enter a name"
              onChange={(e: any) => this.onChange('name', e.target.value)}
              defaultValue={name}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Description:</ControlLabel>
            <FormControl
              placeholder="Enter a description"
              onChange={(e: any) =>
                this.onChange('description', e.target.value)
              }
              defaultValue={description}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Site:</ControlLabel>
            <SelectSite onSelect={this.onSelectSite} initialValue={siteId} />
          </FormGroup>
        </FlexPad>
      </FlexItem>
      // </Step>
    );
  }

  renderButtons = () => {
    const cancelButton = (
      <Link to="/webbuilder/pages">
        <Button btnStyle="simple" icon="times-circle">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}

        <Button btnStyle="success" icon={'check-circle'} onClick={this.save}>
          Save
        </Button>
      </Button.Group>
    );
  };

  render() {
    const { name } = this.state;
    const { page } = this.props;
    console.log('pp', page);
    const breadcrumb = [
      { title: 'Webbuilder', link: '/webbuilder/pages' },
      { title: __('Page') }
    ];

    return (
      <StepWrapper>
        <Wrapper.Header title={'Page Form'} breadcrumb={breadcrumb} />
        <Steps>{this.renderPageContent()}</Steps>
      </StepWrapper>
    );
  }
}

export default PageForm;
