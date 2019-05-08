import { getEnv } from 'apolloClient';
import {
  Button,
  ControlLabel,
  EmptyState,
  FormControl,
  FormGroup
} from 'modules/common/components';
import colors from 'modules/common/styles/colors';
import { SelectBrand } from 'modules/settings/integrations/containers';

import { ModalFooter } from 'modules/common/styles/main';
import { IBrand } from 'modules/settings/brands/types';
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

  save: (
    params: {
      doc: {
        doc: {
          title: string;
          description: string;
          brandId: string;
          languageCode: string;
          color: string;
        };
      };
    },
    callback: () => void,
    topic: ITopic
  ) => void;
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

  save = e => {
    e.preventDefault();

    this.props.save(
      this.generateDoc(),
      () => this.props.closeModal(),
      this.props.topic
    );
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

  generateDoc() {
    const { topic } = this.props;

    return {
      ...topic,
      doc: {
        doc: {
          title: (document.getElementById(
            'knowledgebase-title'
          ) as HTMLInputElement).value,
          description: (document.getElementById(
            'knowledgebase-description'
          ) as HTMLInputElement).value,
          brandId: (document.getElementById('selectBrand') as HTMLInputElement)
            .value,
          languageCode: (document.getElementById(
            'languageCode'
          ) as HTMLInputElement).value,
          color: this.state.color
        }
      }
    };
  }

  renderContent(
    topic = { title: '', description: '', languageCode: '', brand: { _id: '' } }
  ) {
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
          <ControlLabel>Title</ControlLabel>
          <FormControl
            id="knowledgebase-title"
            type="text"
            defaultValue={topic.title}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            id="knowledgebase-description"
            type="text"
            defaultValue={topic.description}
          />
        </FormGroup>

        <FormGroup>
          <SelectBrand
            defaultValue={brandId}
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
            componentClass="select"
            defaultValue={topic.languageCode || 'en'}
            id="languageCode"
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

  render() {
    const { topic, closeModal } = this.props;

    return (
      <form onSubmit={this.save}>
        {this.renderContent(
          topic || {
            title: '',
            description: '',
            languageCode: '',
            brand: { _id: '' }
          }
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
          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default KnowledgeForm;
