import * as React from 'react';

class Form extends React.Component {
  constructor(props: any) {
    super(props);

    this.state = { doc: '', currentPage: 1 };
  }

  renderButtons() {
    return (
      <button
        style={{ backgroundColor: 'green', margin: '5px' }}
        type="button"
        className={`erxes-button btn-block ${''}`}
      >
        Ok
      </button>
    );
  }

  renderForm() {
    return (
      <div className="erxes-form">
        <div className="erxes-form-content">
          <div className="erxes-description">{'hahahah'}</div>

          {/* <div className="erxes-form-fields">{this.renderFields()}</div> */}

          {this.renderButtons()}
        </div>
      </div>
    );
  }

  render() {
    return this.renderForm();
  }
}

export default Form;
