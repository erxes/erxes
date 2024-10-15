import React, { useState } from 'react';
import styled from 'styled-components';
import Popover from "@erxes/ui/src/components/Popover";
import TwitterPicker from "react-color/lib/Twitter";
import { DEFAULT_CHART_COLORS } from './utils';
import { hexToRgba, rgbaToHex } from '../../utils';

type Props = {
    chart: any;
    onClick: (index: number) => void;
    onColorChange: (index: number, color: string) => void;
};

const LegendContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    justify-content: center;
    gap: 10px;
`;

const LegendItem = styled.div<{ borderColor: string }>`
    cursor: pointer;
    text-align: center;
    display: flex;
    align-items: center;
`;

const ColorBox = styled.span<{ backgroundColor: string }>`
    background-color: ${({ backgroundColor }) => backgroundColor};
    width: 12px;
    height: 12px;
    display: inline-block;
    margin-right: 5px;
`;

const LegendLabel = styled.span<{ isHidden: boolean }>`
    color: '#a5a5a5';
    text-decoration: ${({ isHidden }) => (isHidden ? 'line-through' : 'none')};
    font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif; 
    font-size: 12px; 
    font-weight: 400; 
    line-height: 1.2; 
`;

const ChartLegend = ({ chart, onClick, onColorChange }: Props) => {

    if (!chart || !chart.datasets || chart.datasets.length === 0) {
        return null;
    }

    const handleColorChange = (color: { hex: string }, index: number) => {
        const rgbaColor = hexToRgba(color.hex, 0.6);

        onColorChange(index, rgbaColor);
    };

    const renderColorBox = (index: number, color: string) => {

        if (typeof color !== 'string') { return null }

        const hexColor = rgbaToHex(color)

        return <Popover
            placement="bottom"
            trigger={
                <ColorBox backgroundColor={color} />
            }
        >
            <div onMouseDown={(e) => e.stopPropagation()}>
                <TwitterPicker
                    width="240px"
                    triangle="hide"
                    color={{ hex: hexColor }}
                    onChange={e => { handleColorChange(e, index) }}
                    colors={DEFAULT_CHART_COLORS.map(color => rgbaToHex(color))}
                />
            </div>
        </Popover>
    }

    return (
        <LegendContainer>
            {chart.datasets.map((dataset, index) => {
                return (
                    <LegendItem
                        key={dataset.label}
                        borderColor={dataset.borderColor}
                    >
                        {renderColorBox(index, dataset.backgroundColor)}
                        <LegendLabel isHidden={dataset.hidden || false} onClick={() => onClick(index)}>
                            {dataset.label}
                        </LegendLabel>
                    </LegendItem>
                )
            })}
        </LegendContainer>
    );
};

export default ChartLegend;