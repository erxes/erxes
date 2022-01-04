import React, { useState } from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import Button from './Button';
import { colors } from '../styles';
import RTG from 'react-transition-group';

type Props = {
    children: React.ReactNode;
    side?: 'right' | 'left' | 'bottom' | 'top';
    title: string;
    icon?: string;
    width?: number;
    height?: number;
};

const Drawer: React.FC<Props> = ({ children, title, icon, side = 'right', width = 20, height = 25 }) => {
    const [visible, setVisible] = useState('none');
    const [show, setShow] = useState(false);

    const showDrawer = () => {
        if (visible === 'none') {
            setVisible('flex');
            setShow(true);
        }

        setVisible('none');
        setShow(false);
    }

    const DrawerBox = styledTS(styled.div)`
    display: ${visible};
    position: fixed;
    z-index: 1;
    opacity: 0;
    height: 100vh;
    width: 100vw;
    top: 0;
    right: 0;
`;

    const DrawerContainer = styledTS(styled.div)`
    width: 20vw;
    display: flex;
    justify-content: ${side === 'right' || side === 'left' ? 'flex-end' : 'flex-start'};
    align-items: ${side === 'right' || side === 'left' ? 'flex-start' : 'flex-end'};
    flex-direction: ${side === 'right' || side === 'left' ? 'row' : 'column'};
`;

    const DrawerContent = styledTS(styled.div)`
    display: ${visible};
    background-color: ${colors.bgLight};
    position: fixed;
    z-index: 2;
    padding: 12px 24px;
    white-space: normal;
    overflow: hidden;
    height: ${side === 'right' || side === 'left' ? '95vh' : height + 'vh'};
    width: ${side === 'right' || side === 'left' ? width + 'vw' : '96vw'};
    flex-direction: ${side === 'bottom' || side === 'top' ? 'column' : 'row'}; 
    margin-top: ${side === 'bottom' ? '0' : '50px'}
    margin-left: ${side === 'right' ? '0' : '70px'}
    ${side === 'right' ? 'right: 0;' : 'left: 0;'}
    ${side === 'bottom' ? 'bottom: 0;' : 'top: 0;'}
    box-shadow: 4px 0px 15px 0px ${colors.colorCoreGray};
`;

    return (
        <DrawerContainer>
            <Button icon={icon} onClick={showDrawer}>{title}</Button>
            <DrawerBox onClick={showDrawer}>
            </DrawerBox>
            <RTG.CSSTransition
                appear={true}
                in={show}
                timeout={300}
                classNames={`slide-in-${side}`}
                unmountOnExit={true}
            >
                <DrawerContent>
                    {children}
                </DrawerContent>

            </RTG.CSSTransition>
        </DrawerContainer>
    );
}

export default Drawer;