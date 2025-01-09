import Icon from '@erxes/ui/src/components/Icon';
import React from 'react'
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors, dimensions } from '@erxes/ui/src/styles';

const ChartBoxes = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ChartTypeBoxes = styled.div`
  width: 100%;
  display: flex;
  justify-content: start;
  align-items: center;
  overflow: hidden;
  gap: 10px;
`;

const ChartBox = styledTS<{ isActive?: boolean }>(styled.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 7px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  ${props => props.isActive && `background-color: ${colors.colorPrimary};`}
  
  i {
    ${props => props.isActive && `color: white;`}
  }
`;
type Props = {
    defaultValue: any
    chartTypes: string[]
    onChange(chartType: string): void
}

const ChartTypes = (props: Props) => {

    const { defaultValue, chartTypes, onChange } = props

    const renderChartType = (type) => {
        const isActive = defaultValue.value === type

        let icon

        switch (type) {
            case "bar":
                icon = "chart-bar"
                break;
            case "line":
                icon = "chart-line"
                break;
            case "pie":
                icon = "chart-pie"
                break;
            case "doughnut":
                icon = "chart"
                break;
            case "radar":
                icon = "chart"
                break;
            case "polarArea":
                icon = "chart"
                break;
            case "table":
                icon = "table"
                break;
            case "number":
                icon = "table"
                break;
            default:
                break;
        }

        return (
            <ChartBox isActive={isActive} onClick={() => onChange(type)}><Icon icon={icon} size={22} /></ChartBox>
        )
    }


    const renderCharTypes = () => {
        return <ChartTypeBoxes>{chartTypes.map(type => renderChartType(type))}</ChartTypeBoxes>
    }

    const renderColorPalette = () => {
        return <ChartBox><Icon icon='swatchbook' size={22} /></ChartBox>
    }

    return (
        <ChartBoxes>
            {renderCharTypes()}
            {/* {renderColorPalette()} */}
        </ChartBoxes>
    )
}

export default ChartTypes