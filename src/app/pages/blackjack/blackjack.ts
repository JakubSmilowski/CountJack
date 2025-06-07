import { Component, OnInit } from '@angular/core';
import { Blackjack } from '../../services/blackjack';
import { Card } from '../../models/card';
import { CommonModule } from '@angular/common';
import { Hand } from '../../models/hand';

@Component({
  selector: 'app-blackjack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blackjack.html',
  styleUrls: ['./blackjack.css']
})
export class BlackJackComponent implements OnInit {
  deck: Card[] = [];
  shoe: Card[] = [];
  playerHand: Hand = new Hand([], 0);
  dealerHand: Card[] = [];
  dealerHandValue = 0;
  dealerHiddenCard = true;

  // Game state management
  globalState: string = 'waitingForBet';
  roundMessage: string = '';
  
  // Insurance
  insuranceOffered = false;
  insuranceBet = 0;
  
  bankroll: number = 1000;
  runningCount: number = 0;
  runningCountShown = false;

  // Settings
  dealerHitsOnSoft17: boolean = false;
  blackjackPayout: number = 1.5;
  allowEarlySurrender: boolean = false;
  allowLateSurrender: boolean = true;

  ngOnInit(): void {
    this.initializeGame();
  }
  
  constructor(private BlackjackService: Blackjack) { }

  initializeGame() {
    this.deck = this.BlackjackService.initDeck();
    this.shoe = this.BlackjackService.initShoe(1, this.deck);
    this.shoe = this.BlackjackService.splitShoe(this.shoe, 70);
    
    this.runningCount = 0;
    this.globalState = 'waitingForBet';
    this.roundMessage = 'Place your bet to start the round';
    console.log('Game initialized');
  }

  dealCard(): Card {
    if (this.shoe.length === 0) {
      this.initializeGame();
      throw new Error('No more cards in the shoe');
    }
    const card = this.shoe.pop();
    return card!;
  }

  // Place bet
  bet(amount: number) {
    if (this.globalState !== 'waitingForBet') return;
    if (amount > this.bankroll) {
      this.roundMessage = 'Not enough money!';
      return;
    }

    this.bankroll -= amount;
    if(this.playerHand.betAmount > 0){
      this.playerHand.betAmount += amount;
       this.roundMessage = `Bet placed on exisitng hand: ${amount} PLN`;
    } else{
      this.playerHand = new Hand([], amount);
      this.roundMessage = `Bet placed on a new hand: ${amount} PLN`;
    }
  }

  // Start the round after bet is placed
  startRound() {
    if (this.playerHand.betAmount === 0) {
      this.roundMessage = 'Place a bet first!';
      return;
    }

    this.dealInitialCards();
    this.checkForInsurance();
    
    if (this.playerHand.isBlackjack()) {
      this.playerHand.state = 'blackjack';
      this.startDealerTurn();
    } else {
      this.globalState = 'playing';
      this.roundMessage = 'Choose your action';
    }
  }

  // Deal initial cards
  dealInitialCards() {
    this.dealerHand = [];
    this.playerHand.cards = [];
    this.playerHand.state = '';

    // Deal first card to player
    this.playerHand.Hit(this.dealCard());
    
    // Deal first card to dealer
    this.dealerHand.push(this.dealCard());
    
    // Deal second card to player
    this.playerHand.Hit(this.dealCard());
    
    // Deal second card to dealer (hidden)
    this.dealerHand.push(this.dealCard());
    this.dealerHiddenCard = true;
    this.updateDealerHandValue();
  }

  // Check if insurance should be offered
  checkForInsurance() {
    if (this.dealerHand[0].value === 11) { // Dealer shows Ace
      this.insuranceOffered = true;
      this.roundMessage = 'Dealer shows Ace. Insurance available!';
    }
  }

  // Take insurance bet
  takeInsurance() {
    if (!this.insuranceOffered) return;
    
    const maxInsurance = this.playerHand.betAmount / 2;
    if (maxInsurance > this.bankroll) {
      this.roundMessage = 'Not enough money for insurance!';
      return;
    }

    this.bankroll -= maxInsurance;
    this.insuranceBet = maxInsurance;
    this.roundMessage = 'Insurance taken';
  }

  // Player actions
  Stand() {
    if (this.globalState !== 'playing') return;
    this.playerHand.Stand();
    this.startDealerTurn();
  }

  Hit() {
    if (this.globalState !== 'playing') return;
    this.playerHand.Hit(this.dealCard());
    
    if (this.playerHand.isBusted()) {
      this.playerHand.state = 'busted';
      this.roundMessage = 'Busted!';
      this.startDealerTurn();
    } else if (this.playerHand.handSum === 21) {
      this.playerHand.state = 'stand';
      this.startDealerTurn();
    }
  }

  DoubleDown() {
    if (this.globalState !== 'playing') return;
    if (this.playerHand.cards.length !== 2) return;
    
    if (this.bankroll < this.playerHand.betAmount) {
      this.roundMessage = 'Not enough money to double down!';
      return;
    }
    
    // Deduct additional bet
    this.bankroll -= this.playerHand.betAmount;
    
    // Double the bet, hit once, then stand
    this.playerHand.Hit(this.dealCard());
    this.playerHand.DoubleDown();
    
    // Set state based on result
    if (this.playerHand.isBusted()) {
      this.playerHand.state = 'busted';
      this.roundMessage = 'Busted after double down!';
    } else {
      this.playerHand.state = 'stand';
      this.roundMessage = 'Doubled down';
    }
    
    this.startDealerTurn();
  }

  Surrender() {
    if (this.globalState !== 'playing') return;
    if (this.playerHand.cards.length !== 2) return;
    
    this.playerHand.surrender();
    this.bankroll += this.playerHand.betAmount; // Return half the bet
    this.roundMessage = 'Hand surrendered';
    
    this.startDealerTurn();
  }

  // Start dealer's turn
  startDealerTurn() {
    this.globalState = 'dealerTurn';
    this.dealerHiddenCard = false;
    this.updateDealerHandValue();
    this.insuranceOffered = false;
    
    // Process insurance bets first
    this.processInsuranceBets();
    
    this.roundMessage = 'Dealer playing...';
    
    setTimeout(() => {
      this.playDealerHand();
    }, 1000);
  }

  // Process insurance bets
  processInsuranceBets() {
    if (this.insuranceBet > 0) {
      const dealerHasBlackjack = this.isBlackjack(this.dealerHand);
      if (dealerHasBlackjack) {
        // Insurance pays 2:1
        this.bankroll += this.insuranceBet * 3; // Original bet + 2:1 payout
        this.roundMessage += ' Insurance won!';
      }
      // If dealer doesn't have blackjack, insurance bet is already lost
    }
  }

  // Dealer plays according to rules
  playDealerHand() {
    if (this.isBlackjack(this.dealerHand)) {
      this.roundMessage = 'Dealer has Blackjack!';
      this.calculateResults();
      return;
    }

    // Check if player hand is busted or surrendered
    if (this.playerHand.state === 'busted' || this.playerHand.state === 'surrender') {
      this.roundMessage = 'Player busted/surrendered';
      this.calculateResults();
      return;
    }

    // Dealer hits until 17 or more
    const dealerPlayInterval = setInterval(() => {
      if (this.shouldDealerHit()) {
        const newCard = this.dealCard();
        this.dealerHand.push(newCard);
        this.updateDealerHandValue();
        
        if (this.dealerHandValue > 21) {
          this.roundMessage = 'Dealer busted!';
          clearInterval(dealerPlayInterval);
          setTimeout(() => this.calculateResults(), 300);
        }
      } else {
        this.roundMessage = `Dealer stands on ${this.dealerHandValue}`;
        clearInterval(dealerPlayInterval);
        setTimeout(() => this.calculateResults(), 300);
      }
    }, 700);
  }

  shouldDealerHit(): boolean {
    if (this.dealerHandValue < 17) return true;
    if (this.dealerHandValue > 17) return false;
    
    if (this.dealerHandValue === 17) {
      const hasAce = this.dealerHand.some(card => card.value === 11);
      return this.dealerHitsOnSoft17 && hasAce;
    }
    
    return false;
  }

  // Calculate final results and payouts
  calculateResults() {
    const dealerBusted = this.dealerHandValue > 21;
    const dealerBlackjack = this.isBlackjack(this.dealerHand);
    const playerBlackjack = this.playerHand.state === 'blackjack';
    const playerValue = this.playerHand.handSum;
    
    let totalWinnings = 0;
    let resultMessage = '';

    if (this.playerHand.state === 'surrender') {
      resultMessage = 'Surrendered';
    } else if (this.playerHand.state === 'busted') {
      resultMessage = `Busted - Lost ${this.playerHand.betAmount}`;
    } else if (playerBlackjack && dealerBlackjack) {
      totalWinnings = this.playerHand.betAmount;
      resultMessage = 'Push (both Blackjack)';
    } else if (playerBlackjack && !dealerBlackjack) {
      totalWinnings = this.playerHand.betAmount * (1 + this.blackjackPayout);
      resultMessage = `Blackjack! Won ${totalWinnings}`;
    } else if (!playerBlackjack && dealerBlackjack) {
      resultMessage = `Dealer Blackjack - Lost ${this.playerHand.betAmount}`;
    } else if (dealerBusted) {
      totalWinnings = this.playerHand.betAmount * 2;
      resultMessage = `Won ${this.playerHand.betAmount * 2} (dealer busted)`;
    } else if (playerValue > this.dealerHandValue) {
      totalWinnings = this.playerHand.betAmount * 2;
      resultMessage = `Won ${this.playerHand.betAmount * 2}`;
    } else if (playerValue === this.dealerHandValue) {
      totalWinnings = this.playerHand.betAmount;
      resultMessage = 'Push';
    } else {
      resultMessage = `Lost ${this.playerHand.betAmount}`;
    }
    
    this.bankroll += totalWinnings;
    this.roundMessage = resultMessage;
    this.globalState = 'roundComplete';
  }

  // Continue to next round
  continueGame() {
    this.calculateRunningCount();
    this.Reset();
    this.globalState = 'waitingForBet';
    this.roundMessage = 'Place your bet to start the round';
  }

  // Reset game state
  Reset() {
    this.playerHand = new Hand([], 0);
    this.dealerHand = [];
    this.dealerHandValue = 0;
    this.dealerHiddenCard = true;
    this.roundMessage = '';
    this.insuranceOffered = false;
    this.insuranceBet = 0;
  }

  // Helper functions
  updateDealerHandValue() {
    if (this.dealerHiddenCard && this.dealerHand.length > 0) {
      this.dealerHandValue = this.dealerHand[0].value;
    } else {
      this.dealerHandValue = this.calculateHandValue(this.dealerHand);
    }
  }

  calculateHandValue(cards: Card[]): number {
    let value = 0;
    let aces = 0;

    for (const card of cards) {
      if (card.value === 11) {
        aces++;
        value += 11;
      } else {
        value += card.value;
      }
    }

    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  }

  isBlackjack(cards: Card[]): boolean {
    return cards.length === 2 && this.calculateHandValue(cards) === 21;
  }

  // Convert card value to display value
  getCardDisplayValue(card: Card): string {
    switch (card.value) {
      case 11: return 'A';
      case 10: 
        if (card.suit === '♠' || card.suit === '♣') {
          return card.value === 10 ? (card.suit === '♠' ? 'J' : 'Q') : 'K';
        } else {
          return card.value === 10 ? (card.suit === '♥' ? 'J' : 'Q') : 'K';
        }
      default: return card.value.toString();
    }
  }

  // Convert card suit to icon
  getCardSuitIcon(suit: string): string {
    switch (suit) {
      case 'spades': return '♠';
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      default: return suit;
    }
  }

  // Getter functions for template
  get gameStateMessage(): string {
    switch (this.globalState) {
      case 'waitingForBet': return 'Place your bet';
      case 'playing': return 'Your turn';
      case 'dealerTurn': return 'Dealer playing';
      case 'roundComplete': return 'Round complete';
      default: return '';
    }
  }

  get canBet(): boolean {
    return this.globalState === 'waitingForBet';
  }

  get canStartRound(): boolean {
    return this.globalState === 'waitingForBet' && this.playerHand.betAmount > 0;
  }

  get canContinue(): boolean {
    return this.globalState === 'roundComplete';
  }

  get canPlay(): boolean {
    return this.globalState === 'playing';
  }

  get visibleDealerCards(): Card[] {
    if (this.dealerHiddenCard && this.dealerHand.length > 1) {
      return [this.dealerHand[0]];
    }
    return this.dealerHand;
  }

  // Check if surrender is available
  get canSurrender(): boolean {
    if (this.playerHand.cards.length !== 2) return false;
    
    if (this.allowEarlySurrender) return true;
    if (this.allowLateSurrender && !this.isBlackjack(this.dealerHand)) return true;
    
    return false;
  }

  get canDoubleDown(): boolean {
    return this.globalState === 'playing' && 
           this.playerHand.cards.length === 2 && 
           this.bankroll >= this.playerHand.betAmount;
  }

  calculateRunningCount(){
    for (let i = 0; i < this.playerHand.cards.length; i++) {
      if (this.playerHand.cards[i].value > 9) {
        this.runningCount--;
      }else if(this.playerHand.cards[i].value < 7){
        this.runningCount++;
      }else{
        this.runningCount += 0;
      }
    }
    for(let i = 0; i < this.dealerHand.length; i++){
      if (this.dealerHand[i].value > 9) {
        this.runningCount--;
      }else if(this.dealerHand[i].value < 7){
        this.runningCount++;
      }else{
        this.runningCount += 0;
      }
    }
  }

  toggleRunningCount() {
    this.runningCountShown = !this.runningCountShown;
  } 
}