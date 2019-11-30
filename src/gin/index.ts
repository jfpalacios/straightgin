import { Card } from "./Card";
import { Hand } from "./Hand";
import { Deck } from "./Deck";

const Events: { [key: string]: string } = {
  DEAL: "DEAL",
  READY: "READY",
  PLAYER_0_DRAW_DECK: "PLAYER_0_DRAW_DECK",
  PLAYER_0_DRAW_DISCARD: "PLAYER_0_DRAW_DISCARD",
  PLAYER_1_DRAW_DECK: "PLAYER_1_DRAW_DECK",
  PLAYER_1_DRAW_DISCARD: "PLAYER_1_DRAW_DISCARD",
  PLAYER_0_DISCARD: "PLAYER_0_DISCARD",
  PLAYER_1_DISCARD: "PLAYER_1_DISCARD",
  PLAYER_0_TURN: "PLAYER_0_TURN",
  PLAYER_1_TURN: "PLAYER_1_TURN",
  PLAYER_0_WIN: "PLAYER_0_WIN",
  PLAYER_1_WIN: "PLAYER_1_WIN"
};

class Gin {
  private playerCount = 0;
  private playerHands: Hand[] = [new Hand(), new Hand()];
  private discardPile: Card[] = [];
  private deck = new Deck();
  private hasDrawn = false;
  private listeners: any[] = [];
  private currentPlayer = 0;
  private startingPlayer = 0;
  private isActiveGame = false;
  private score = [0, 0]
  constructor() {
    return this;
  }

  addPlayer(cb: Function) {
    if (this.playerCount === 2) {
      throw new Error("2 Players have already been registered");
    }

    let player = this.playerCount;
    this.listeners.push([
      cb,
      (event: string) => ({ event, state: this.getState(player) })
    ]);
    this.playerCount++;
    if (this.playerCount === 2) {
      this.publishEvent(Events.READY);
    }

    return {
      drawFromDeck: () => this.draw({ fromDiscard: false }, player),
      drawFromDiscard: () => this.draw({ fromDiscard: true }, player),
      getCards: () => this.playerHands[player].getCards() || [],
      discard: (card: Card) => this.discard(card, player),
      getTopCard: () => {
        return this.topOfPile;
      },
      goGin: (card: Card) => this.goGin(card, player)
    };
  }

  getState(player: number) {
    return {
      isActiveGame: this.isActiveGame,
      currentPlayer: this.currentPlayer,
      startingPlayer: this.startingPlayer,
      hasDrawn: this.hasDrawn,
      discardPile: this.topOfPile,
      hand: this.playerHands[player].getCards(),
    };
  }

  nextGame() {
    if (this.isActiveGame) {
      throw new Error("endGame before starting a new game");
    }

    this.startingPlayer = this.startingPlayer === 0 ? 1 : 0;
    this.currentPlayer = this.startingPlayer;
    this.playerHands = [new Hand(), new Hand()];
    this.discardPile = [];
    this.deck = new Deck();
    this.hasDrawn = false;

    this.publishEvent(Events.READY);
  }

  deal() {
    if (this.isActiveGame) {
      throw new Error("Cannot deal until nextGame");
    }

    this.isActiveGame = true;

    // starting player is dealt 11 and is first to play
    this.hasDrawn = true;

    this.playerHands[0].addCards(
      this.deck.dealN(this.currentPlayer === 0 ? 11 : 10)
    );

    this.playerHands[1].addCards(
      this.deck.dealN(this.currentPlayer === 0 ? 10 : 10)
    );

    this.publishEvent(Events.DEAL);
  }

  get topOfPile() {
    if (!this.discardPile.length) {
      return null;
    }

    return this.discardPile[this.discardPile.length - 1];
  }

  draw({ fromDiscard }: any, player: number): Card | undefined {
    this.checkTurn(player)

    if (this.hasDrawn) {
      throw new Error(`PLAYER_${this.currentPlayer} has already drawn`);
    }

    const playerHand = this.playerHands[this.currentPlayer];
    let card = fromDiscard ? this.discardPile.pop() : this.deck.dealN(1)[0];
    if (card) {
      playerHand.addCards(card);
    }

    this.hasDrawn = true;
    let key = `PLAYER_${this.currentPlayer}_DRAW_${
      fromDiscard ? "DISCARD" : "DECK"
    }`;
    this.publishEvent(Events[key]);

    return card;
  }

  discard(card: Card, player: number) {
    this.checkTurn(player)

    if (!this.hasDrawn) {
      throw new Error("Player hasn't drawn, unable to discard");
    }

    const playerHand = this.playerHands[this.currentPlayer];
    playerHand.discard(card);
    this.discardPile.push(card);

    this.hasDrawn = false;
    this.publishEvent(Events[`PLAYER_${this.currentPlayer}_DISCARD`]);
    this.currentPlayer = this.currentPlayer === 0 ? 1 : 0;
    this.publishEvent(Events[`PLAYER_${this.currentPlayer}_TURN`]);
  }

  goGin(card: Card, player: number) {
    this.checkTurn(player)

    if (!this.hasDrawn) {
      throw new Error("Player hasn't drawn, unable to go gin");
    }

    const playerHand = this.playerHands[this.currentPlayer];
    let hand = playerHand.goGin(card);
    if (!hand) {
      throw new Error("Invalid gin hand");
    }

    let otherPlayer = this.currentPlayer === 0 ? 1 : 0
    let losingHand = this.playerHands[otherPlayer].getBestHand();
    
    this.isActiveGame = false;
    this.score[this.currentPlayer] += losingHand.deadwoodPoints
    this.publishWinner(player, hand, losingHand);

    return hand;
  }

  private publishWinner(winner: number, winningHand: any, losingHand: any) {
    let event = `PLAYER_${this.currentPlayer}_WIN`;
    this.listeners.forEach(([cb, stateFn]) => {
      let result = stateFn(event);
      result.state = {
        ...result.state,
        winner,
        winnerPointsGained: losingHand.deadwoodPoints,
        winningHand,
        losingHand,
        score: this.score
      };

      cb(result)
    });
  }

  private checkTurn(player: number) {
    if(!this.isActiveGame) {
      throw new Error("Game is not active");
    }

    if (this.currentPlayer !== player) {
      throw new Error(
        `It is not your turn, current player is PLAYER_${this.currentPlayer}`
      );
    }
  }

  private publishEvent(event: string) {
    this.listeners.forEach(([cb, stateFn]) => cb(stateFn(event)));
  }
}

export { Gin };
