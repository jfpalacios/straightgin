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
	// 13 * 4 representation
	// Spades 0:12
	// Hearts 13:25
	// Diamonds 26:38
	// Clubs 39:51
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
				case "DEAL":
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
		this.cards = Array.from(new Array(52), () => 0);
		cards.forEach((card: any) => {
			let index = (card.suit - 1) * 13 + (card.rank - 1);
			this.cards[index] = 1;
		});
	}

	printCards() {
		let cards = this.cards.slice();
		let str = "  A 2 3 4 5 6 7 8 9 T J Q K\n";
		let suits = ["\u2660 ", "\u2665 ", "\u2666 ", "\u2663 "];
		while (cards.length) {
			let c = cards.splice(0, 13);
			str += suits.shift();
			str += c.join(" ");
			str += "\n";
		}
	}

	evaluateAfterDraw() {
		this.handlers.discard(this.handObject.cards[0]);
	}

	identifyRuns() {
		let cards = this.cards;
		for (let i = 0; i < 4; i++) {
			let c = this.getCardsByRow(i);
			let [maxSequence, total]: any = this.maxSequenceAndTotal(c, 0);
			if (maxSequence === 4) {
			} else if (maxSequence === 3) {
			}
		}
	}

	identifySets() {
		let cards = this.cards;
		for (let i = 0; i < 13; i++) {
			let c = this.getCardsByColumn(i);
			let meld = this.getIndicesByColumn(i);
			let total = c.reduce((acc, c) => acc + c, 0);
			if (total === 3) {
				let indices = meld.filter(i => this.cards[i]);
				this.completed3Melds.push(indices);
			} else if (total === 4) {
				this.completed4Melds.push(meld);
			} else if (total === 2) {
				let indices = meld.filter(i => this.cards[i]);
				this.potentialSets.push(indices);
			}
		}
	}

	maxSequenceAndTotal(cards: any, k = 0) {
		let zeroes = 0;
		let tail = 0;

		for (let i = 0; i < cards.length; i++) {
			if (cards[i] === 0) {
				zeroes++;
			}

			if (zeroes > k) {
				if (cards[tail] === 0) {
					zeroes--;
				}

				tail++;
			}
		}

		return cards.length - tail;
	}

	getRankByIndex(index: any) {
		return (index % 13) + 1;
	}

	getIndexByCard(rank: any, suit: any) {
		return (suit - 1) * 13 + (rank - 1);
	}

	getCardsByRow(row: any) {
		return this.cards.slice(row * 13, row * 13 + 13);
	}

	getCardsByColumn(column: any) {
		return this.getIndicesByColumn(column).map(i => this.cards[i]);
	}

	getIndicesByColumn(column: any) {
		return [column, column + 13, column + 13 * 2, column + 13 * 3];
	}
}

export default EasyComputer;
