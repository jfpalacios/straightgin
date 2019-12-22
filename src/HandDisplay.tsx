import React from 'react';

import { Card } from './gin/Card';

import { Meld } from './gin/Meld';
import { MeldSet } from './gin/MeldSet';
import CardElement from './components/Card';

import './HandDisplay.css';

type HandDisplayProps = {
	hand: any;
};

const HandDisplay = (props: HandDisplayProps) => {
	if (!props.hand) {
		return <div />;
	}

	return (
		<div>
			<div className="meld-sets">
				{props.hand.melds.map((cards: Card[], index: number) => {
					return (
						<div key={index} className="meld-set">
							{cards.map((card: Card) => {
								return (
									<CardElement
										key={`item-${card.rank}-${card.suit}`}
										className="card-tight"
										Rank={card.rank}
										Suit={card.suit}
									/>
								);
							})}
						</div>
					);
				})}
			</div>
			<div className="deadwood">
				{props.hand.deadwood.map((card: Card) => {
					return (
						<CardElement
							key={`item-${card.rank}-${card.suit}`}
							className="card-tight"
							Rank={card.rank}
							Suit={card.suit}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default HandDisplay;
