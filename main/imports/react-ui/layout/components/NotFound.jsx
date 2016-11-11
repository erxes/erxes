import React from 'react';


function NotFound() {
  return (
    <div className="auth-content">
      <div className="container">
        <div className="col-md-7">
          <div className="auth-description not-found">
            <img src="/assets/images/logo.png" alt="erxes" />
            <h1>404. This page is not found.</h1>
            <p>
              erxes is an open-source, all-in-one customer engagement platform<br />
              for teams to build aspiring customer experience.
            </p>
            <a href="http://erxes.io/">&laquo; Go to home page</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
