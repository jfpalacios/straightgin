import { Card } from './Card'

class Meld {
  readonly cards: Card[];
  readonly mask = 0;
  constructor(cards: Card[]) {
    this.cards = cards;
    for (var i = 0; i < cards.length; i++) {
      this.mask |= 1 << this.cards[i].index;
    }
  }
}

export { Meld };