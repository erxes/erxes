import Button from "../../common/Button";
import Icon from "../../common/Icon";
import { NotFoundWrapper } from "../styles";
import React from "react";
import { __ } from "../../../utils";

function NotFound() {
  return (
    <NotFoundWrapper>
      <div className="auth-content">
        <div className="container">
          <div className="col-md-7">
            <div className="auth-description not-found">
              <img src="/images/not-found.png" alt="erxes" />
              <h1>{__("Page not found")}</h1>
              <p>
                {__("Sorry but the page you are looking for cannot be found")}
              </p>
              <Button href="/welcome">
                <Icon icon="arrow-left" /> {__("Back to home")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </NotFoundWrapper>
  );
}

export default NotFound;
