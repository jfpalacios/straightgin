enum Suit {
  SPADES = 1,
  HEARTS,
  DIAMONDS,
  CLUBS
}

class Card {
  static Suit = Suit;
  static rankNames: any = {
    1: "A",
    11: "J",
    12: "Q",
    13: "K"
  };
  public index: number = 0;
  readonly rank: number;
  readonly suit: number;
  private name: string;
  constructor(rank: number, suit: Suit) {
    this.rank = rank;
    this.suit = suit;
    this.name = this.toString();
  }

  get suitName() {
    switch (this.suit) {
      case 1:
        return "\u2660";
      case 2:
        return "\u2665";
      case 3:
        return "\u2666";
      case 4:
        return "\u2663";
    }

    return ""
  }

  toString() {
    let rank;
    if (this.rank < 2 || this.rank > 10) {
      rank = Card.rankNames[this.rank];
    } else {
      rank = this.rank;
    }

    return `${this.suitName}${rank}`;
  }

  get points() {
    return Math.min(this.rank, 10);
  }
}

export { Card, Suit };
