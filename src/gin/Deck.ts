import { Card, Suit } from "./Card";

class Deck {
  static ranks = Array.from(new Array(13), (_, i) => i + 1);
  private cards: Card[] = [];
  constructor() {
    this.newDeck();
  }

  newDeck() {
    Object.values(Suit).forEach(suit => {
      // Typescript duplicates as string and number :(
      if (typeof suit == 'number') {
        Deck.ranks.forEach(rank => {
          this.cards.push(new Card(rank, suit as Suit));
        });
      }
    });

    this.shuffle();
  }

  shuffle() {
    const cards = this.cards;
    // Fisher Yates
    for (let i = cards.length - 1; i > 0; i--) {
      let index = Math.floor(Math.random() * (i + 1));

      [cards[i], cards[index]] = [cards[index], cards[i]];
    }

    return cards;
  }

  dealN(n: number) {
    if (n > this.cards.length) {
      throw new Error("Insufficient cards remaining");
    }

    return this.cards.splice(0, n);
  }

  get length() {
    return this.cards.length;
  }

  pop() {
    return this.cards.pop();
  }
}

export { Deck };
