import React from 'react'
import styled from 'styled-components';
import { formatNumbers } from '../../utils';

const NumberContainer = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

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
        <NumberContainer>
            <Title>{labels}</Title>
            <Number>{formatNumbers(data, 'x', 'commarize')}</Number>
        </NumberContainer>
    )
}

export default NumberRenderer