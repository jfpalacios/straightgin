import React from "react";

import { Card } from "./gin/Card";
import CardElement from "./components/Card";

type DiscardPileProps = {
	card: Card;
	onDraw: Function;
};

const DiscardPile = (props: DiscardPileProps) => {
	return (
		<div
			onClick={() => {
				props.onDraw();
			}}
			className="card card-separated discard-pile"
		>
			{props.card && (
				<CardElement Rank={props.card.rank} Suit={props.card.suit} />
			)}
		</div>
	);
};

export default DiscardPile;
