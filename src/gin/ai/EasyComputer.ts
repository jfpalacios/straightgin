/* tslint:disable */
/*
	drawFromDeck
  drawFromDiscard
  getCards
  discard
  getTopCard
  goGin
	 */

class EasyComputer {
	cards: any;
	completed3Melds: any = [];
	completed4Melds: any = [];
	potentialSets: any = [];
	potentialRuns: any = [];
	handlers: any;
	handObject: any;

	registerHandlers(handlers: any) {
		this.handlers = handlers;
	}

	listener({ event, state }: any) {
		// this.loadCards(state.hand);
		this.handObject = state.handObject;

		setTimeout(() => {
			switch (event) {
				case 'DEAL':
					this.loadCards(this.handlers.getCards());
					if (state.currentPlayer === state.player) {
						this.evaluateAfterDraw();
					}
					break;
				case `PLAYER_${state.player}_TURN`:
					setTimeout(() => {
						this.handlers.drawFromDeck();
						this.evaluateAfterDraw();
					}, 1000);

					break;
			}
		});
	}

	loadCards(cards: any) {
		this.cards = Array.from(new Array(4), () =>
			Array.from(new Array(13), () => 0)
		);

		cards.forEach((card: any) => {
			this.cards[card.suit - 1][card.rank - 1] = 1;
		});
		console.log(this.cards);
	}

	printCards() {
		let cards = this.cards.slice();
		let str = '  A 2 3 4 5 6 7 8 9 T J Q K\n';
		let suits = ['\u2660 ', '\u2665 ', '\u2666 ', '\u2663 '];

		while (cards.length) {
			let c = cards.splice(0, 1);
			str += suits.shift();
			str += c.join(' ');
			str += '\n';
		}
	}

	evaluateAfterDraw() {
		this.handlers.discard(this.handObject.cards[0]);
		this.printCards();
	}

	identifyRuns() {}

	identifySets() {}
}

export default EasyComputer;
