import React from 'react';

class PageOptions extends React.Component {
  render() {
    return (
      <div className="page-options">
        <div className="btn-group btn-group-sm" role="group" aria-label="...">
          <button type="button" className="btn btn-default">
            Create Message
          </button>
        </div>

        <div className="pull-right">
          <select className="form-control form-control-sm">
            <option>Displayed user attributes</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </select>
        </div>
      </div>
    );
  }
}

export default PageOptions;
