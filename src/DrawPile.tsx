import React from 'react';

import CardElement from './components/Card';

import back from './assets/back.png';

const DrawPile = (props: any) => {
	return (
		<div onClick={props.onDraw}>
			{props.hasCard && (
				<img className="draw-pile card card-separated" src={back} />
			)}
		</div>
	);
};

export default DrawPile;
