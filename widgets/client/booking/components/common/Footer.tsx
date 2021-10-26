import * as React from 'react';
import Button from "../common/Button"

type Props = {
    goToBookings?: () => void;
    goToFloor?: () => void;
    goToProduct?: () => void;
};

let onClickHandler = () => {
    // typees n hamaaraad shiljdeg bh 
}

function Block({ }: Props) {
    return (
        <div className="footer">
            {/* <Button
                text={"Back"}
                type="back"
                onClickHandler={onClickHandler}
                style={{ backgroundColor: widgetColor }}
            />
            <Button
                text={"Next"}
                type="back"
                onClickHandler={onClickHandler}
                style={{ backgroundColor: widgetColor }}
            /> */}
        </div>
    );
}
