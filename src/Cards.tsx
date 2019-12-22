import React, { useRef } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

import Card from './components/Card';

const SortableCard = SortableElement(Card);

const SortableList = SortableContainer((props: any) => {
  return (
    <div className="card-container">
      {props.items.map((card: any, index: number) => (
        <SortableCard
          key={`item-${card.rank}-${card.suit}`}
          index={index}
          disabled={props.disabled}
          Rank={card.rank}
          Suit={card.suit}
        />
      ))}
    </div>
  );
});

type CardsProps = {
  cards: [];
  disabled?: boolean;
  onSort?: Function;
  onDragOut?: Function;
};

const Cards = (props: CardsProps) => {
  const cards = props.cards;
  let ref: any = useRef(null);

  if (props.disabled) {
    return <SortableList disabled={true} axis="xy" items={cards} />;
  }

  const draggedOut = { out: false };
  const onSortEnd = ({ oldIndex, newIndex }: any, e: any) => {
    if (draggedOut.out && props.onDragOut) {
      props.onDragOut(cards[oldIndex], oldIndex);
    } else if (props.onSort) {
      props.onSort(arrayMove(cards, oldIndex, newIndex));
    }
  };
  let dragElement: any;
  let cardContainerTop: any;

  return (
    <SortableList
      ref={ref}
      helperClass="card--dragging"
      axis="xy"
      items={cards}
      onSortMove={(event: any) => {
        dragElement = document.getElementsByClassName('card--dragging')[0];
        if (ref) {
          let { current } = ref;
          if (
            current.boundingClientRect.top - current.boundingClientRect.height >
            dragElement.getBoundingClientRect().top
          ) {
            draggedOut.out = true;
          } else {
            draggedOut.out = false;
          }
        }
      }}
      onSortEnd={onSortEnd}
    />
  );
};

export default Cards;
