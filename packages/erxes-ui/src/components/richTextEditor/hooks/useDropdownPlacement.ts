import * as React from 'react';
import { usePopper } from 'react-popper';

export type ParamType = {
    boundaryElement?: Element | Array<Element>;
};

const useDropdownPlacement = ({ boundaryElement }: ParamType = {}) => {
    // Popper values, they are stored in state so the component can re-adjust itself as value/s are selected/added
    const [referenceElement, setReferenceElement] =
        React.useState<HTMLElement | null>();

    const [popperElement, setPopperElement] =
        React.useState<HTMLElement | null>();

    // Used to place the dropdown menu either on the top or the bottom of the Listbox/Combobox
    const popper = usePopper(referenceElement, popperElement, {
        modifiers: [
            {
                name: 'flip',
                options: {
                    // Switch between top and bottom for the position of the element
                    fallbackPlacements: ['top', 'bottom'],
                    boundary: boundaryElement || 'clippingParents',
                    allowedAutoPlacements: ['top', 'bottom'],
                },
            },
            {
                name: 'computeStyles',
                options: {
                    // By setting gpuAcceleration to false Popper will use top/left properties with the position: absolute and not transform translate3d
                    gpuAcceleration: false, // true by default
                },
            },
        ],
    });

    return {
        referenceElement,
        setReferenceElement,
        popperElement,
        setPopperElement,
        popper,
    };
};

export default useDropdownPlacement;
