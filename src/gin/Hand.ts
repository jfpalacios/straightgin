import { Card } from "./Card";
import { Meld } from "./Meld";
import { MeldSet } from "./MeldSet";

class Hand {
  private cards: Card[] = [];

  getCards() {
    return this.cards;
  }

  addCards(cards: Card[] | Card) {
    if (Array.isArray(cards)) {
      this.cards = this.cards.concat(cards);
    } else {
      this.cards.push(cards);
    }
  }

  discard(card: Card): boolean {
    let index = this.cards.indexOf(card);
    if (index >= 0) {
      this.cards.splice(index, 1);
      return true;
    }

    return false;
  }

  goGin(discard: Card) {
    let allMelds = this.getAllMelds();
    let validMeld = allMelds.filter(meld => {
      return meld.deadwood.length === 1 && meld.deadwood[0] === discard;
    });

    return validMeld.length ? validMeld[0].format() : false;
  }

  getBestHand() {
    let allMelds = this.getAllMelds() || [];
    if (!allMelds.length) {
      let meldSet = new MeldSet([], 10);
      meldSet.calculateDeadwood(this.cards)
      allMelds.push(meldSet)
    }

    return allMelds[0].format();
  }

  private getAllMelds() {
    // assign unique index to each card
    this.cards.forEach((card, index) => (card.index = index));
    let cards = this.cards.slice();
    const runs = this.getRuns(this.sortCardsSuitRank(this.cards));
    const sets = this.getSets(this.sortCardsRankSuit(this.cards));
    const totalMelds = [...runs, ...sets];
    const hands = this.getAllPossibleHands(totalMelds, cards);
    return hands;
  }

  public getAllPossibleHands(melds: Meld[], cards: Card[]) {
    const handsAcc: MeldSet[] = [];
    for (var i = 0; i < melds.length; i++) {
      this.getMeldSetRecursive(
        cards.length,
        melds,
        new MeldSet([melds[i]], cards.length),
        handsAcc
      );
    }

    return this.sumMelds(handsAcc, cards);
  }

  // Utils
  public sortCardsRankSuit(cards: Card[] = this.cards) {
    return cards.sort((a, b) => {
      if (a.rank === b.rank) {
        return a.suit - b.suit;
      } else {
        return a.rank - b.rank;
      }
    });
  }

  public sortCardsSuitRank(cards: Card[] = this.cards) {
    return cards.sort((a, b) => {
      if (a.suit === b.suit) {
        return a.rank - b.rank;
      } else {
        return a.suit - b.suit;
      }
    });
  }

  private getRuns(cards: Card[]): Meld[] {
    cards = this.sortCardsSuitRank(cards);

    const runs = [];
    var runLength = 1;
    for (var i = 1; i < cards.length; i++) {
      const cardInSequence =
        cards[i].suit === cards[i - 1].suit &&
        cards[i].rank === cards[i - 1].rank + 1;

      if (cardInSequence) {
        runLength++;
      } else {
        if (runLength >= 3) {
          runs.push(cards.slice(i - runLength, i));
        }
        runLength = 1;
      }
    }

    // one last time after loop ends
    if (runLength >= 3) {
      runs.push(cards.slice(i - runLength, i));
    }

    // Generate combinations from runs
    let results: Meld[] = [];
    runs.forEach(run => {
      results.push(...this.getMeldPermutations(run));
    });

    return results;
  }

  private getSets(cards: Card[]) {
    let cardsMap: { [key: number]: { count: number; cards: Card[] } } = {};
    cards.forEach(card => {
      if (!cardsMap[card.rank]) {
        cardsMap[card.rank] = { count: 0, cards: [] };
      }

      cardsMap[card.rank].cards.push(card);
      cardsMap[card.rank].count++;
    });

    let sets: Card[][] = [];
    Object.entries(cardsMap).forEach(([num, { count, cards }]) => {
      if (count >= 3) {
        sets.push(cards);
      }
    });

    let results: Meld[] = [];
    sets.forEach(s => {
      results.push(...this.getMeldPermutations(s));
    });

    return results;
  }

  private getMeldSetRecursive(
    cardsLength: number,
    melds: Meld[],
    meldSet: MeldSet,
    acc: MeldSet[]
  ) {
    // get compatible nodes
    const filtered = melds.filter(
      m => (meldSet.mask & ~m.mask) === meldSet.mask
    );

    if (!filtered.length) {
      acc.push(meldSet);
      return;
    }

    filtered.forEach(f => {
      this.getMeldSetRecursive(
        cardsLength,
        filtered,
        new MeldSet([...meldSet.melds, f], cardsLength),
        acc
      );
    });
  }

  private sumMelds(meldSets: MeldSet[], cards: Card[]): MeldSet[] {
    // Filter out duplicates from the meldSets permutations
    let maskToObject: { [key: number]: MeldSet } = {};
    meldSets.forEach(meldSet => {
      maskToObject[meldSet.mask] = meldSet;
    });

    return Object.values(maskToObject)
      .map(meldSet => meldSet.calculateDeadwood(cards))
      .sort((a, b) => a.deadwoodPoints - b.deadwoodPoints);
  }

  private getMeldPermutations(sequence: Card[]): Meld[] {
    const results = [];
    const max = Math.min(5, sequence.length);
    for (var i = 3; i <= max; i++) {
      for (var j = 0; j <= sequence.length - i; j++) {
        const meld = new Meld(sequence.slice(j, i + j));
        results.push(meld);
      }
    }

    return results;
  }
}

export { Hand };
