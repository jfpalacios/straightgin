import React from 'react';

import Gin from './gin';
import EasyComputer from './gin/ai/EasyComputer';

import { Card } from './gin/Card';
import Cards from './Cards';
import DiscardPile from './DiscardPile';
import DrawPile from './DrawPile';
import HandDisplay from './HandDisplay';

import './App.css';

class App extends React.Component {
  state: any = {
    cards: [],
    isGinning: false,
    gameState: {
      discardPile: null
    }
  };

  controls: any;

  updateCards = (cards: any) => {
    this.setState({ cards });
  };

  handleSort = (cards: any) => {
    this.updateCards(cards);
  };

  handleStart = () => {
    let gin = new Gin();
    gin.subscribe(({ event, state }: any) => {
      console.log(event, state);
    });

    this.controls = gin.addPlayer(({ event, state }: any) => {
      this.setState({
        gameState: state,
        error: false
      });

      if (event == 'DEAL') {
        this.updateCards(state.hand);
      } else if (
        event == 'PLAYER_0_DRAW_DISCARD' ||
        event == 'PLAYER_0_DRAW_DECK'
      ) {
        this.setState({
          cards: this.state.cards.concat(state.hand[state.hand.length - 1])
        });
      }
    });

    let computer = new EasyComputer();
    let computerControls = gin.addPlayer(computer.listener.bind(computer));
    computer.registerHandlers(computerControls);
    gin.deal();
  };

  handleDiscard = (card: Card, index: number) => {
    if (this.isTurn() && this.state.gameState.hasDrawn) {
      if (this.state.isGinning) {
        if (this.controls.goGin(card)) {
          this.setState({ isGinning: false });
        } else {
          this.setState({ isGinning: false, error: 'Invalid gin hand.' });
        }
      } else {
        this.setState({
          cards: this.state.cards.filter((card: Card, i: number) => {
            return index !== i;
          })
        });
        this.controls.discard(card);
      }
    }
  };

  handleDrawDeck = () => {
    if (this.isTurn() && !this.state.gameState.hasDrawn) {
      this.controls.drawFromDeck();
    }
  };

  handleDrawDiscard = (event: any) => {
    if (this.isTurn() && !this.state.gameState.hasDrawn) {
      this.controls.drawFromDiscard();
    }
  };

  isTurn = () => {
    return this.state.gameState.currentPlayer === 0;
  };

  getPrompt = () => {
    const state = this.state.gameState;
    if (!state.isActiveGame) {
      return '';
    }

    if (state.currentPlayer == 0) {
      if (this.state.isGinning) {
        return 'Discard deadwood';
      }

      if (state.hasDrawn) {
        return 'Your turn to discard';
      } else {
        return 'Your turn to draw from pile or deck';
      }
    } else {
      return 'Computer thinking...';
    }
  };

  handleEnterGin = () => {
    if (this.state.gameState.hasDrawn) {
      this.setState({ isGinning: true });
    }
  };

  render() {
    const isActive = this.state.gameState.isActiveGame;

    return (
      <div className="container">
        <div>
          <button onClick={this.handleStart}>
            {this.state.gameState.isActiveGame ? 'Restart' : 'Start'}
          </button>
        </div>
        {isActive && (
          <div className="play-area">
            <DiscardPile
              onDraw={this.handleDrawDiscard}
              card={this.state.gameState.discardPile}
            />
            <DrawPile onDraw={this.handleDrawDeck} hasCard={isActive} />
          </div>
        )}
        {isActive && (
          <div className="cards">
            <div className="instructions">
              {this.state.error} {this.getPrompt()}
              {this.state.gameState.hasDrawn && (
                <button className="go-gin-button" onClick={this.handleEnterGin}>
                  Go Gin
                </button>
              )}
            </div>
            <Cards
              cards={this.state.cards}
              onSort={this.handleSort}
              onDragOut={this.handleDiscard}
            />
          </div>
        )}
        {!isActive && this.state.gameState.losingHand && (
          <div className="cards">
            <HandDisplay hand={this.state.gameState.losingHand} />
            <div className="instructions">Game Over</div>
            <HandDisplay hand={this.state.gameState.winningHand} />
          </div>
        )}
      </div>
    );
  }
}

export default App;
