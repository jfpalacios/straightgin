/* tslint:disable */

import React, { useState } from "react";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import arrayMove from "array-move";

import Gin from "./gin";
import Card from "./components/Card";

import "./App.css";

const SortableCard = SortableElement(Card);

const SortableList = SortableContainer((props: any) => {
  return (
    <div className="card-container">
      {props.items.map((card: any, index: number) => (
        <SortableCard
          key={`item-${card.rank}-${card.suit}`}
          index={index}
          Rank={card.rank}
          Suit={card.suit}
        />
      ))}
    </div>
  );
});

const App: React.FC = () => {
  let gin = new Gin();
  let p1 = gin.addPlayer(() => {});
  let p2 = gin.addPlayer(() => {});
  gin.deal();

  const [cards, setCards] = useState(p1.getCards());
  const onSortEnd = ({ oldIndex, newIndex }: any, e: any) => {
    setCards(arrayMove(cards, oldIndex, newIndex));
  };
  let dragElement: any;
  let cardContainerTop: any;

  return (
    <div className="center">
      <SortableList
        helperClass="card--dragging"
        axis="xy"
        items={cards}
        onSortMove={(event: any) => {
          // if (!dragElement || !cardContainerTop) {
          //   dragElement = document.getElementsByClassName("card--dragging")[0];
          //   cardContainerTop = document.getElementsByClassName("card-container")[0].getBoundingClientRect().top;
          // } 
          // let rect = dragElement.getBoundingClientRect();
 
          // if (cardContainerTop - rect.top > rect.height ) {
          //   console.log("past")
          // }
        }}
        onSortEnd={onSortEnd}
      />
    </div>
  );
};

export default App;
