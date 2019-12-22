import { Card } from './Card';
import { Hand } from './Hand';
import { Deck } from './Deck';
// import { EncryptedDeck } from './EncryptedDeck';

const GameEvents: { [key: string]: string } = {
  DEAL: 'DEAL',
  READY: 'READY',
  DRAW: 'DRAW',
  PLAYER_0_DRAW_DECK: 'PLAYER_0_DRAW_DECK',
  PLAYER_0_DRAW_DISCARD: 'PLAYER_0_DRAW_DISCARD',
  PLAYER_1_DRAW_DECK: 'PLAYER_1_DRAW_DECK',
  PLAYER_1_DRAW_DISCARD: 'PLAYER_1_DRAW_DISCARD',
  PLAYER_0_DISCARD: 'PLAYER_0_DISCARD',
  PLAYER_1_DISCARD: 'PLAYER_1_DISCARD',
  PLAYER_0_TURN: 'PLAYER_0_TURN',
  PLAYER_1_TURN: 'PLAYER_1_TURN',
  PLAYER_0_WIN: 'PLAYER_0_WIN',
  PLAYER_1_WIN: 'PLAYER_1_WIN'
};

class Gin {
  private playerCount = 0;
  private playerHands: Hand[] = [new Hand(), new Hand(), new Hand()];
  private discardPile: Card[] = [];
  private deck = new Deck();
  // private encryptedDeck = new EncryptedDeck();
  private hasDrawn = false;
  private listeners: any[] = [];
  private watchers: any[] = [];

  private currentPlayer = 0;
  private startingPlayer = 0;
  private isActiveGame = false;
  public score = [0, 0];
  private currentGame = 0;

  constructor() {
    return this;
  }

  addPlayer(cb: Function) {
    if (this.playerCount === 2) {
      throw new Error('2 Players have already been registered');
    }

    let player = this.playerCount;
    this.listeners.push([cb, player]);
    this.playerCount++;
    if (this.playerCount === 2) {
      this.publishEvent(GameEvents.READY);
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

  subscribe(cb: Function) {
    this.watchers.push([cb, -1]);
  }

  getState(player: number) {
    return {
      player,
      isActiveGame: this.isActiveGame,
      currentPlayer: this.currentPlayer,
      startingPlayer: this.startingPlayer,
      hasDrawn: this.hasDrawn,
      discardPile: this.topOfPile,
      hand: this.playerHands[player].getCards(),
      handObject: this.playerHands[player]
    };
  }

  getGameState() {
    return {
      isActiveGame: this.isActiveGame,
      currentPlayer: this.currentPlayer,
      startingPlayer: this.startingPlayer,
      hasDrawn: this.hasDrawn,
      discardPile: this.topOfPile
    };
  }

  resetGame() {
    this.isActiveGame = false;
    this.startingPlayer = this.startingPlayer === 0 ? 1 : 0;
    this.currentPlayer = this.startingPlayer;
    this.playerHands = [new Hand(), new Hand(), new Hand()];
    this.discardPile = [];
    this.deck = new Deck();
    this.hasDrawn = true;

    this.publishEvent(GameEvents.READY);
  }

  deal() {
    if (this.isActiveGame) {
      throw new Error('Cannot deal until nextGame');
    }

    this.isActiveGame = true;

    // starting player is dealt 11 and is first to play
    this.hasDrawn = true;

    this.playerHands[0].addCards(
      this.deck.dealN(this.currentPlayer === 0 ? 11 : 10)
    );

    this.playerHands[1].addCards(
      this.deck.dealN(this.currentPlayer === 0 ? 10 : 11)
    );

    this.publishEvent(GameEvents.DEAL);
  }

  get topOfPile() {
    if (!this.discardPile.length) {
      return null;
    }

    return this.discardPile[this.discardPile.length - 1];
  }

  draw({ fromDiscard }: any, player: number): Card | undefined {
    this.checkTurn(player);

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
      fromDiscard ? 'DISCARD' : 'DECK'
    }`;
    this.publishEvent(GameEvents[key]);

    return card;
  }

  discard(card: Card, player: number) {
    this.checkTurn(player);

    if (!this.hasDrawn) {
      throw new Error("Player hasn't drawn, unable to discard");
    }

    const playerHand = this.playerHands[this.currentPlayer];
    playerHand.discard(card);
    this.discardPile.push(card);

    this.hasDrawn = false;
    this.publishEvent(GameEvents[`PLAYER_${this.currentPlayer}_DISCARD`]);
    this.currentPlayer = this.currentPlayer === 0 ? 1 : 0;

    if (!this.deck.length) {
      this.publishEvent(GameEvents.DRAW);
      return;
    }

    this.publishEvent(GameEvents[`PLAYER_${this.currentPlayer}_TURN`]);
  }

  goGin(card: Card, player: number) {
    this.checkTurn(player);

    if (!this.hasDrawn) {
      throw new Error("Player hasn't drawn, unable to go gin");
    }

    const playerHand = this.playerHands[player];
    let hand = playerHand.goGin(card);
    if (!hand) {
      return false;
    }

    let otherPlayer = this.currentPlayer === 0 ? 1 : 0;
    let losingHand = this.playerHands[otherPlayer].getBestHand();

    this.isActiveGame = false;
    this.score[this.currentPlayer] += losingHand.deadwoodPoints;
    this.publishWinner(player, hand, losingHand);

    return hand;
  }

  private publishWinner(winner: number, winningHand: any, losingHand: any) {
    let event = `PLAYER_${this.currentPlayer}_WIN`;
    let self = this;

    this.watchers.forEach(function([cb]: any) {
      let result: any = { event, state: self.getGameState() };
      result.state = {
        ...result.state,
        winner,
        winnerPointsGained: losingHand.deadwoodPoints,
        winningHand,
        losingHand,
        score: self.score
      };

      cb(result);
    }, this);

    this.listeners.forEach(([cb, player]) => {
      let result: any = { event, state: this.getState(player) };
      result.state = {
        ...result.state,
        winner,
        winnerPointsGained: losingHand.deadwoodPoints,
        winningHand,
        losingHand,
        score: this.score
      };

      cb(result);
    });
  }

  private checkTurn(player: number) {
    if (!this.isActiveGame) {
      throw new Error('Game is not active');
    }

    if (this.currentPlayer !== player) {
      throw new Error(
        `It is not your turn, current player is PLAYER_${this.currentPlayer}`
      );
    }
  }

  private publishEvent(event: string) {
    let self = this;

    this.watchers.forEach(function([cb]: any) {
      return cb({ event, state: self.getGameState() });
    }, this);

    this.listeners.forEach(function([cb, player]: any) {
      return cb({ event, state: self.getState(player) });
    }, this);
  }
}

export default Gin;
