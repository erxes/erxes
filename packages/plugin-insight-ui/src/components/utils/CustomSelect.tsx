import React from 'react'
import Select, { MenuPlacement } from "react-select";

type Props = {
    value: any[]
    multi?: boolean
    options: any[]
    fieldLabel: string
    fieldValueOptions?: any[]

    onSelect: (option: any) => void
}

const CustomSelect = (props: Props) => {

    const {
        value,
        multi,
        options,
        fieldLabel,
        fieldValueOptions,
        onSelect,
    } = props

    if (fieldValueOptions) {
        console.log("props", props)
    }

    const handleValueOptionChange = (fieldName, fieldType) => {

        // const updatedValue = value.map((option) => {
        //     if (option.value === fieldName) {
        //         return {
        //             ...option,
        //             fieldDefaultValue: !option.fieldDefaultValue,
        //         };
        //     }
        //     return option;
        // });

        // onSelect(updatedValue);
    }

    const renderValueOption = (valueOption) => {

        const { fieldName, fieldType, fieldLabel, fieldDefaultValue } = valueOption

        switch (fieldType) {
            case "checkbox":
                return (
                    <div
                        style={{ display: "flex", justifyContent: "center" }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <input
                            checked={fieldDefaultValue}
                            type="checkbox"
                            name=""
                            id={fieldName}
                            style={{ margin: "0 5px 0 0" }}
                            onChange={() => handleValueOptionChange(fieldName, fieldType)}
                        />
                        <label htmlFor={fieldName}>{fieldLabel}</label>
                    </div>
                )
            default:
                break;
        }

    }

    const CustomMultiValue = ({ children, removeProps, fieldValueOptions }) => {
        return (
            <div
                style={{
                    backgroundColor: "#6569DF",
                    color: "#fff",
                    margin: "0 5px 0 0",
                    padding: "5px 10px",
                    borderRadius: "11px",
                    position: "relative",
                    display: "flex",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {children}
                    {fieldValueOptions?.map(renderValueOption)}
                </div>

                <button
                    style={{
                        all: "unset",
                        position: "absolute",
                        top: 0,
                        right: "5px",
                        cursor: "pointer",
                    }}
                    {...removeProps}
                >
                    x
                </button>
            </div>
        );
    };

    const finalProps = {
        value: value,
        isClearable: true,
        isMulti: multi,
        onChange: onSelect,
        options: options,
        placeholder: fieldLabel,
        menuPlacement: "auto" as MenuPlacement
    };

    if (fieldValueOptions?.length) {
        finalProps["components"] = {
            MultiValue: (props) => <CustomMultiValue {...props} fieldValueOptions={fieldValueOptions} />
        }
    }

    return (
        <Select
            {...finalProps}
        />
    )
}

export default CustomSelect