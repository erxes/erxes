import Button from "@erxes/ui/src/components/Button";
import Icon from "@erxes/ui/src/components/Icon";
import { TabTitle, Tabs } from "@erxes/ui/src/components/tabs/index";
import { __ } from "@erxes/ui/src/utils/core";
import React, { useState } from "react";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import Card from "./Card";
import { TabAction } from "./ReplyFbMessage";

const MainWrapper = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 10% 80% 10%;
`;

const TabsWrapper = styled.div`
  width: 100%;
  overflow: hidden;
`;

const TabContainer = styled.div`
  transition: transform 0.5s ease;
`;

const TabButton = styledTS<{ disabled?: Boolean }>(styled.div)`
  margin: 5px 10px;
  cursor: pointer;
  ${({ disabled }) => (disabled ? "color:#888 !important" : "")}
`;

const RighButton = styled(TabButton)``;
const LeftButton = styled(TabButton)``;

const generateSelectedPageId = (cards: any[]) => {
  return cards[0]?._id || "";
};

function Cards({ cards, onChange }) {
  const [selectedPageId, setSelectedPageId] = useState(
    generateSelectedPageId(cards || [])
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  const selectedPage = cards.find((card) => card._id === selectedPageId);
  const totalSlides = Math.ceil(cards.length / 3) + 1;

  const onSelectTab = (id) => {
    setSelectedPageId(id);
  };

  const handleRemovePage = (_id) => {
    const filteredCards = cards.filter((card) => card._id !== _id);

    onChange(filteredCards);
  };

  const addPage = () => {
    const _id = Math.random().toString();

    onChange([
      ...cards,
      {
        _id,
        label: `Page ${(cards?.length || 0) + 1}`
      }
    ]);
    setSelectedPageId(_id);
  };

  const handleChange = (_id, name, value) => {
    const updatedCards = cards.map((card) =>
      card._id === _id ? { ...card, [name]: value } : card
    );

    onChange(updatedCards);
  };

  const handlePrevClick = () => {
    setCurrentSlide((prevSlide) => (prevSlide > 0 ? prevSlide - 1 : 0));
  };
  const handleNextClick = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide + 1 < totalSlides ? prevSlide + 1 : totalSlides - 1
    );
  };

  return (
    <div>
      <MainWrapper>
        <LeftButton
          onClick={handlePrevClick}
          disabled={currentSlide === 0}>
          <Icon
            icon='angle-left'
            size={20}
          />
        </LeftButton>
        <TabsWrapper>
          <TabContainer
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            <Tabs>
              {cards.map(({ _id, label }) => (
                <TabTitle
                  key={_id}
                  className={_id === selectedPageId ? "active" : ""}
                  onClick={() => onSelectTab(_id)}>
                  <span style={{ whiteSpace: "nowrap" }}>{__(label)}</span>
                  <TabAction onClick={() => handleRemovePage(_id)}>
                    <Icon icon='times-circle' />
                  </TabAction>
                </TabTitle>
              ))}
              {cards.length < 10 && (
                <Button
                  btnStyle='link'
                  icon='focus-add'
                  onClick={addPage}
                />
              )}
            </Tabs>
          </TabContainer>
        </TabsWrapper>
        <RighButton
          onClick={handleNextClick}
          disabled={totalSlides === currentSlide + 1}>
          <Icon
            icon='angle-right-b'
            size={20}
          />
        </RighButton>
      </MainWrapper>

      {selectedPage && (
        <Card
          card={selectedPage}
          onChange={handleChange}
        />
      )}
    </div>
  );
}

export default Cards;
