import * as ph from "pohlig-hellman";

import { Card, Suit } from "./Card";
import { any } from "prop-types";
import { SlowBuffer } from "buffer";

class EncryptedDeck {
  private cards: string[] = [];
  private shuffleKey?: ph.Cipher;
  private encryptedDeck: Buffer[] = [];
  constructor() {
    this.newDeck(() => {});
  }

  newDeck(cb: Function) {
    this.cards = Array.from(new Array(52), (v, k) => k.toString());
    this.shuffle();

    ph.createCipher(128).then(cipher => {
      this.shuffleKey = cipher;
      this.cards.forEach((val, i) => {
        this.encryptedDeck[i] = cipher.encrypt(val);
      });
      console.log(this.encryptedDeck)
    });
  }

  generateCardKeys() {}

  encryptDeck() {}

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

export { EncryptedDeck };
