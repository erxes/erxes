import { getEnv } from 'apolloClient';
import {
  Button,
  ControlLabel,
  EmptyState,
  Form,
  FormControl,
  FormGroup
} from 'modules/common/components';
import colors from 'modules/common/styles/colors';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { IBrand } from 'modules/settings/brands/types';
import { SelectBrand } from 'modules/settings/integrations/containers';
import {
  ColorPick,
  ColorPicker,
  MarkdownWrapper
} from 'modules/settings/styles';
import * as React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { ChromePicker } from 'react-color';
import CopyToClipboard from 'react-copy-to-clipboard';
import * as ReactMarkdown from 'react-markdown';
import { ITopic } from '../../types';

type Props = {
  topic: ITopic;
  brands: IBrand[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove?: (knowledgeBaseId: string) => void;
  closeModal: () => void;
};

type State = {
  copied: boolean;
  code: string;
  color: string;
};

class KnowledgeForm extends React.Component<Props, State> {
  static installCodeIncludeScript() {
    const { REACT_APP_CDN_HOST } = getEnv();

    return `
      (function() {
        var script = document.createElement('script');
        script.src = "${REACT_APP_CDN_HOST}/build/knowledgeBaseWidget.bundle.js";
        script.async = true;
        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
      })();
    `;
  }

  static getInstallCode(topicId) {
    return `
      <script>
        window.erxesSettings = {
          knowledgeBase: {
            topic_id: "${topicId}"
          },
        };
        ${KnowledgeForm.installCodeIncludeScript()}
      </script>
    `;
  }

  constructor(props: Props) {
    super(props);

    let code = '';
    let color = colors.colorPrimary;

    // showed install code automatically in edit mode
    if (props.topic) {
      code = KnowledgeForm.getInstallCode(props.topic._id);
      color = props.topic.color;
    }

    this.state = {
      copied: false,
      code,
      color
    };
  }

  onColorChange = e => {
    this.setState({ color: e.hex });
  };

  remove = () => {
    const { remove, topic } = this.props;

    if (remove) {
      remove(topic._id);
    }
  };

  renderInstallCode() {
    if (this.props.topic && this.props.topic._id) {
      const onCopy = () => this.setState({ copied: true });

      return (
        <FormGroup>
          <ControlLabel>Install code</ControlLabel>
          <MarkdownWrapper>
            <ReactMarkdown source={this.state.code} />
            {this.state.code ? (
              <CopyToClipboard text={this.state.code} onCopy={onCopy}>
                <Button size="small" btnStyle="primary" icon="copy">
                  {this.state.copied ? 'Copied' : 'Copy to clipboard'}
                </Button>
              </CopyToClipboard>
            ) : (
              <EmptyState icon="copy" text="No copyable code" size="small" />
            )}
          </MarkdownWrapper>
        </FormGroup>
      );
    } else {
      return null;
    }
  }

  handleBrandChange = () => {
    if (this.props.topic && this.props.topic._id) {
      const code = KnowledgeForm.getInstallCode(this.props.topic._id);
      this.setState({ code, copied: false });
    }
  };

  generateDoc = (values: {
    _id?: string;
    title: string;
    description: string;
    brandId: string;
    languageCode: string;
  }) => {
    const { topic } = this.props;
    const finalValues = values;

    if (topic) {
      finalValues._id = topic._id;
    }

    return {
      _id: finalValues._id,
      doc: {
        brandId: finalValues.brandId,
        description: finalValues.description,
        languageCode: finalValues.languageCode,
        title: finalValues.title,
        color: this.state.color
      }
    };
  };

  renderFormContent(topic = {} as ITopic, formProps: IFormProps) {
    const { brand } = topic;
    const brandId = brand != null ? brand._id : '';

    const popoverTop = (
      <Popover id="color-picker">
        <ChromePicker color={this.state.color} onChange={this.onColorChange} />
      </Popover>
    );

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel required={true}>Title</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={topic.title}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={topic.description}
          />
        </FormGroup>

        <FormGroup>
          <SelectBrand
            isRequired={true}
            defaultValue={brandId}
            formProps={formProps}
            onChange={this.handleBrandChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Choose a custom color</ControlLabel>
          <div>
            <OverlayTrigger
              trigger="click"
              rootClose={true}
              placement="bottom"
              overlay={popoverTop}
            >
              <ColorPick full={true}>
                <ColorPicker
                  style={{ backgroundColor: this.state.color }}
                  full={true}
                />
              </ColorPick>
            </OverlayTrigger>
          </div>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Language</ControlLabel>

          <FormControl
            {...formProps}
            componentClass="select"
            defaultValue={topic.languageCode || 'en'}
            name="languageCode"
          >
            <option />
            <option value="mn">Монгол</option>
            <option value="en">English</option>
          </FormControl>
        </FormGroup>

        {this.renderInstallCode()}
      </React.Fragment>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { topic, closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        {this.renderFormContent(
          topic || {
            title: '',
            description: '',
            languageCode: '',
            brand: { _id: '' }
          },
          { ...formProps }
        )}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>
          {topic && (
            <Button
              btnStyle="danger"
              type="button"
              onClick={this.remove}
              icon="cancel-1"
            >
              Delete
            </Button>
          )}
          {renderButton({
            name: 'knowledge base',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: topic
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default KnowledgeForm;
