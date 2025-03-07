import styled, { css, keyframes } from "styled-components"
import styledTS from "styled-components-ts"

const unitSpacing = 10
const coreSpacing = unitSpacing * 2
const headerSpacing = 50
const headerSpacingWide = headerSpacing + 20
const colorCoreRed = "#EA475D"
const colorCoreYellow = "#F7CE53"
const colorCoreGreen = "#3CCC38"
const colorCoreBlue = "#3B85F4"
const colorShadowGray = "#DDD"
const colorWhite = "#FFF"

// Border colors
const borderPrimary = "#EEE"
const textPrimary = "#444"

export default {
  unitSpacing,
  coreSpacing,
  headerSpacing,
  headerSpacingWide,
  colorCoreBlue,
  colorCoreYellow,
  colorCoreRed,
  colorCoreGreen,
  colorWhite,
}

const slideRight: any = keyframes`
  0% {
    transform: translateX(20px);
    opacity: 0.7;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`
export const IncomingCallNav = styledTS<{ type?: string }>(styled.div)`
  display: flex;
  position: fixed;
  bottom: ${(props) => (props.type === "outgoing" ? "0" : "150px")};
  right: ${(props) => (props.type === "outgoing" ? "0" : "20px")};
  z-index: 999;
  animation: ${css`
    ${slideRight}
  `} 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1;

  button {
    height: 30px;
    margin: auto 0;
  }
`
const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.2);
  }
`

export const NameCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  > h5 {
    margin: 0 0 10px;

    > i {
      margin-right: 5px;
      animation: ${css`
          ${pulse}`} 2s infinite;
    }
  }

  > h4 {
    font-weight: 800;
    word-break: break-word;
  }
`

export const IncomingContainer = styled.div`
  padding: ${unitSpacing}px;
  text-align: center;
  min-width: 380px;
  background: ${colorWhite};
  border: 1px solid ${borderPrimary};
  border-radius: ${unitSpacing}px;
  overflow: hidden;
`

export const IncomingContent = styled.div`
  background: linear-gradient(
    170.05deg,
    #5b38ca 0%,
    #4e31a8 49.66%,
    #1f0f53 98.7%
  );
  padding: ${coreSpacing + unitSpacing}px;
  color: ${colorWhite};
  border-radius: ${unitSpacing}px;
  min-width: 375px;

  > p {
    margin: ${unitSpacing}px 0;
  }
`
export const InCallFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
`

export const Actions = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  flex-direction: column;
  gap: 10px;

  > div {
    .coming-soon {
      margin-bottom: -10px;
      margin-top: -3px;
      font-size: 10px;
      color: #ddd;
    }
  }
`
export const InnerActions = styled.div`
  display: flex;
  gap: 25px;
`

export const CallAction = styledTS<{
  $isDecline?: boolean
  $active?: boolean
  $disabled?: boolean
}>(styled.div)`
  width: 60px;
  height: 60px;
  border-radius: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  color: ${(props) => (props.$active ? textPrimary : colorWhite)};
  background: ${(props) =>
    props.$disabled
      ? colorShadowGray
      : props.$isDecline
      ? colorCoreRed
      : props.$active
      ? colorWhite
      : "rgba(255, 255, 255, 0.4)"};
  margin-bottom: 2px;
  transition: all ease .3s;

  ${(props) =>
    props.$isDecline &&
    `
    justify-self: center;
    grid-column-start: span 3;
  `}

  &:hover {
    background: ${(props) =>
      props.$isDecline
        ? "rgba(234, 71, 93, 0.6)"
        : !props.$active && !props.$disabled && "rgba(255, 255, 255, 0.2)"};
  }
`
