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
    <div>
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
  const onSortEnd = ({ oldIndex, newIndex }: any) => {
    let container = document.getElementsByClassName("card-container")[0]
      .children[0];
    for (let i = 0; i < cards.length; i++) {
      container.children[i].classList.remove("increase");
    }
    setCards(arrayMove(cards, oldIndex, newIndex));
  };

  return (
    <div className="card-container">
      <SortableList
        helperClass="card--dragging"
        axis="xy"
        items={cards}
        onSortEnd={onSortEnd}
        onSortOver={({ newIndex }: any) => {
          let container = document.getElementsByClassName("card-container")[0]
            .children[0];
          for (let i = 0; i < cards.length; i++) {
            if (i > newIndex || newIndex == 0) {
              container.children[i].classList.add("increase");
            } else {
              container.children[i].classList.remove("increase");
            }
          }
        }}
      />
    </div>
  );
};

export default App;
