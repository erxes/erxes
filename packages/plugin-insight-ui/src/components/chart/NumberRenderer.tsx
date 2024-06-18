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

const Num = styled.div`
    font-size: clamp(1em, 5vw, 2em);
`;

type IDataSet = {
    title: string;
    data: number[] | any;
    labels: string[];
};

type Props = {
    dataset: IDataSet;
}

const NumberRenderer = (props: Props) => {
    const { dataset } = props;
    const { title, data, labels } = dataset;

    return (
        <NumberContainer>
            <Title>{labels}</Title>
            <Num>{formatNumbers(data, 'x', 'commarize')}</Num>
        </NumberContainer>
    )
}

export default NumberRenderer