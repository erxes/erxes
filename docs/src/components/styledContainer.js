import React from "react";

const StyledContainer = (props) => {
    const { title, description, text } = props;


    return (
        <>
            <h1>{title}</h1>
            <p>{description}</p>
            
            <CopyBlock
                language="javascript"
                text={text}
                codeBlock
                theme={dracula}
                showLineNumbers={false}
            />
        </>

    )
}

export default StyledContainer;