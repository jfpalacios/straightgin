import { Card } from "./Card";
import { Meld } from "./Meld";

class MeldSet {
  deadwood: Card[] = [];
  deadwoodPoints: number = 0;
  mask: number = 0;
  readonly melds: Meld[] = [];
  indices: any = {};
  totalCards: number = 0;
  constructor(melds: Meld[], totalCards: number) {
    this.totalCards = totalCards;
    this.melds = melds;
    this.melds.forEach(meld => {
      this.mask |= meld.mask;
    });
  }

  addDeadwood(card: Card) {
    this.deadwood.push(card);
    this.deadwoodPoints += card.points;
  }

  calculateDeadwood(cards: Card[]) {
    this.getMissingIndices()
      .map(i => cards[i])
      .forEach(card => {
        this.addDeadwood(card);
      });

    return this;
  }

  showHand() {
    let hand = [];
    this.melds.forEach(meld => {
      meld.cards.forEach(card => {
        hand.push(card.toString() + " ");
      });
      hand.push("  ");
    });
    hand.push("\n");
    hand.push("Deadwood: " + this.deadwoodPoints + " - ");
    this.deadwood.forEach(card => {
      hand.push(card.toString() + " ");
    });
    console.log(hand.join(""));
  }

  format() {
    return {
      deadwood: this.deadwood,
      deadwoodPoints: this.deadwoodPoints,
      melds: this.melds.map(meld => meld.cards)
    };
  }

  private getMissingIndices() {
    this.melds.forEach(meld => {
      meld.cards.forEach(card => {
        this.indices[card.index] = true;
      });
    });

    const results = [];
    for (var i = 0; i < this.totalCards; i++) {
      if (!this.indices[i]) {
        results.push(i);
      }
    }

    return results;
  }
}

export { MeldSet };
