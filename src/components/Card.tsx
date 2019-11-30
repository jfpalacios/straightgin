import React from "react";
import "./Card.scss";
import { number } from "prop-types";

interface CardProps {
  Rank: number;
  Suit: number;
}

const Card: React.FC<CardProps> = ({ Rank, Suit }) => {
  let suitName: string = "s";
  switch (Suit) {
    case 1:
      suitName = "s";
      break;
    case 2:
      suitName = "h";
      break;
    case 3:
      suitName = "d";
      break;
    case 4:
      suitName = "c";
      break;
  }

  return (
    <div className="card">
      <div className={`inner ${suitName}_${Rank}`}></div>
    </div>
  );
};

export default Card;
