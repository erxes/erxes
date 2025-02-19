import * as React from "react";

import Button from "../common/Button";
import Container from "../common/Container";
import CountrySelect from "../common/CountrySelect";
import { __ } from "../../../utils";

type Props = {
  isSubmitted: boolean;
  handleSubmit: () => void;
  handleNextButton: () => void;
};

const Call: React.FC<Props> = ({
  handleSubmit,
  isSubmitted,
  handleNextButton,
}) => {
  return (
    <Container title={__("Call")} withBottomNavBar={false}>
      <div className="call-container">
        <div className="h-full flex flex-col justify-center">
          <div className="flex flex-col gap-4 mb-10">
            <div className="form-group">
              <label className="control-label" htmlFor={`field-name`}>
                Phone number
              </label>
              <div className="phone-input-wrapper form-control">
                <CountrySelect />
                <input autoFocus placeholder="Enter phone number" />
              </div>
            </div>

            <div className="form-group">
              <label className="control-label" htmlFor={`field-name`}>
                Email
              </label>
              <input className="form-control" placeholder="Enter your email" />
            </div>

            <div className="form-group">
              <label className="control-label" htmlFor={`field-name`}>
                Who would you like to contact?
              </label>
              <select
                className="form-control"
                // value={attrs.value || options[0]}
              >
                <option value="aa">erfer</option>
              </select>
            </div>
          </div>
          <Button full onClick={handleNextButton}>
            <span className="font-semibold">{__("Call")}</span>
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default Call;
