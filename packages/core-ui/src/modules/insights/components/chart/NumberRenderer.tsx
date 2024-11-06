import React from 'react'
import styled from 'styled-components';
import styledTs from 'styled-components-ts';
import { formatNumbers } from '../../utils';

const NumberContainer = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    align-items: center;

    &:after {
        content:'';
        position: absolute;
        left: 50%;
        transform: translate(-50%);
        bottom: -20px;
        height: 1px;
        width: 60%;
        background: #AAA;
    }
`;

const NumberLayout = styledTs<{ column: number }>(styled.div)`
    display: grid;
    grid-template-columns: repeat(${(props) => props.column >= 2 ? 2 : 1}, 1fr);
    grid-gap: 50px;
`

const Title = styled.div`
    font-size: 12px;
`;

const Number = styled.div`
    font-size: clamp(1em, 5vw, 2em);
`;

type IDataSet = {
    title: string;
    data: number[] | any;
    labels: string[];
};

type Props = {
    dataset: IDataSet;
    serviceName: string
}

const NumberRenderer = (props: Props) => {
    const { dataset, serviceName } = props;
    const { title, data, labels } = dataset;

    return (

        <NumberLayout column={labels?.length || 1}>
            {(labels || []).map((label, index) => (
                <NumberContainer key={index}>
                    <Title>{label}</Title>
                    <Number>{formatNumbers(data[index], 'x', 'commarize')}</Number>
                </NumberContainer>
            ))}
        </NumberLayout>

    )
}

export default NumberRenderer