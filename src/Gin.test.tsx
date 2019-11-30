import { Gin } from "./gin";

let gin: Gin;
let lastEvent: any = null;
let lastState: any = null;
let p0: any;
let p1: any;
let eventsQ: any = [];

beforeEach(() => {
  gin = new Gin();
  eventsQ = [];
  p0 = gin.addPlayer(({ event, state }: any) => {
    lastEvent = event;
    lastState = state;
    eventsQ.unshift(event);
  });
  p1 = gin.addPlayer(() => {});
});

it("Deals Deck", () => {
  gin.deal();
  expect(lastEvent).toEqual("DEAL");
  expect(lastState.currentPlayer).toEqual(0);
  expect(lastState.startingPlayer).toEqual(0);
  expect(lastState.hasDrawn).toBeTruthy();
  expect(lastState.discardPile).toBeNull();
  expect(lastState.hand.length).toEqual(11);
  expect(lastState.hand.length).toEqual(11);
});

it("Resets properly", () => {
  gin.nextGame();
  expect(lastEvent).toEqual("READY");
  expect(lastState.currentPlayer).toEqual(1);
  expect(lastState.startingPlayer).toEqual(1);
  expect(lastState.hasDrawn).toBeFalsy();
  expect(lastState.discardPile).toBeNull();
  expect(lastState.hand.length).toEqual(0);
});

it("Prevents next game during play", () => {
  gin.deal();
  try {
    gin.nextGame();
  } catch (e) {
    expect(e.message).toEqual("endGame before starting a new game");
  }
});

it("Discards and Draws", () => {
  expect(p0.getCards()).toHaveLength(0);
  gin.deal();
  expect(p0.getCards()).toHaveLength(11);
  expect(p1.getCards()).toHaveLength(10);

  // P0
  expect(lastState.currentPlayer).toEqual(0);
  let p0Cards = p0.getCards();
  let firstCard = p0Cards[0];
  p0.discard(firstCard);
  expect(eventsQ[1]).toEqual("PLAYER_0_DISCARD");
  expect(lastEvent).toEqual("PLAYER_1_TURN");
  expect(p0.getTopCard()).toEqual(firstCard);
  expect(lastState.hasDrawn).toBeFalsy();

  // P0
  expect(lastState.currentPlayer).toEqual(1);
  expect(lastEvent).toEqual("PLAYER_1_TURN");
  let drawnCard = p1.drawFromDiscard();
  expect(drawnCard).toEqual(firstCard);
  expect(lastEvent).toEqual("PLAYER_1_DRAW_DISCARD");
  expect(lastState.hasDrawn).toBeTruthy();
  p1.discard(drawnCard);
  expect(eventsQ[1]).toEqual("PLAYER_1_DISCARD");

  // P0
  expect(lastState.currentPlayer).toEqual(0);
  expect(lastEvent).toEqual("PLAYER_0_TURN");
  p0.drawFromDeck();
  expect(lastEvent).toEqual("PLAYER_0_DRAW_DECK");
  expect(lastState.hand).toHaveLength(11);
  try {
    p0.drawFromDeck();
  } catch (e) {
    expect(e.message).toEqual("PLAYER_0 has already drawn");
  }
  p0.discard(p0.getCards()[0]);
  expect(eventsQ[1]).toEqual("PLAYER_0_DISCARD");

  try {
    p0.discard(p0.getCards()[0]);
  } catch (e) {
    expect(e.message).toEqual(
      "It is not your turn, current player is PLAYER_1"
    );
  }
});

it("Ends game", () => {
  gin.deal();
  expect(lastState.isActiveGame).toBeTruthy();

  for (var i = 0; i < 11; i++) {
    gin.playerHands[0].cards[i].rank = i + 1;
    gin.playerHands[0].cards[i].suit = 1;
  }

  p0.goGin(p0.getCards()[0]);
  expect(lastState.winner).toEqual(0);
  expect(lastEvent).toEqual("PLAYER_0_WIN");
  expect(lastState.isActiveGame).toBeFalsy()
  expect(lastState.losingHand).toHaveProperty("deadwood")
  expect(lastState.losingHand).toHaveProperty("deadwoodPoints")
  expect(lastState.losingHand).toHaveProperty("melds")
});
