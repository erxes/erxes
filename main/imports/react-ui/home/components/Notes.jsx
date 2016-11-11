import React from 'react';


function Notes() {
  return (
    <div>
      <div className="alert alert-warning">
        <div className="title">
        <div className="full-name">
          <a href="/details" className="alert-link">Anar-Erdene Batjargal</a>
        </div>
        <small className="date">
          About 11min ago
        </small>
      </div>
      <p className="message">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Nunc lobortis ut sapien at egestas. In pellentesque porttitor nulla.
        Praesent id molestie velit. In faucibus eu erat non lobortis.
        Nunc ex urna, interdum a ultrices sed, aliquet vitae libero.
        Mauris imperdiet sed augue nec fringilla.
      </p>
      </div>
      <div className="box">
        <div className="well">
          <p>Reply via Message</p>
          <p><textarea className="form-control" rows="5"></textarea></p>
          <a href="#" className="btn btn-default">Respond & Active</a>
        </div>
      </div>
    </div>
  );
}

export default Notes;
