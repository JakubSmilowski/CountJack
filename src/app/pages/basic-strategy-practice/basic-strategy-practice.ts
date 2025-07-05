import { Component, OnInit } from '@angular/core';
import { Blackjack } from '../../services/blackjack';
import { Card } from '../../models/card';
import { CommonModule, provideCloudinaryLoader } from '@angular/common';
import { Hand } from '../../models/hand';

interface BasicStrategyDecision {
  action: 'H' | 'S' | 'D' | 'Ds' | 'P' | 'SUR' | 'N' | 'Y' | 'YN';
  description: string;
}

@Component({
  selector: 'app-basic-strategy-practice',
  imports: [CommonModule],
  templateUrl: './basic-strategy-practice.html',
  styleUrl: './basic-strategy-practice.css'
})
export class BasicStrategyPractice implements OnInit {
  deck: Card[] = [];
  shoe: Card[] = [];
  playerHand: Hand = new Hand([], 0);
  dealerHand: Card[] = [];
  dealerUpCard: Card | null = null;
  

  //Settings:
  dasAlloowed: boolean = true;
  practiceMode: string = "all";

  // Practice state
  practiceState: 'waiting' | 'decision' | 'feedback' = 'waiting';
  playerAction: string = '';
  correctAction: string = '';
  isCorrect: boolean = false;
  feedback: string = '';
  
  // Statistics
  correctCount: number = 0;
  totalCount: number = 0;
  
  // Basic Strategy Tables
  private hardTotalStrategy: { [key: string]: { [key: string]: string } } = {
    '8': { '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },//correct
    '9': { '2': 'H', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },//correct
    '10': { '2': 'D', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'D', '8': 'D', '9': 'D', '10': 'H', 'A': 'H' },//correct
    '11': { '2': 'D', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'D', '8': 'D', '9': 'D', '10': 'D', 'A': 'D' },//correct
    '12': { '2': 'H', '3': 'H', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },//correct
    '13': { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },//correct
    '14': { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },//correct
    '15': { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },//correct
    '16': { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' }, //Correct
    '17': { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' } //Correct
  };

  private softTotalStrategy: { [key: string]: { [key: string]: string } } = {
    'A,2': { '2': 'H', '3': 'H', '4': 'H', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },//correct
    'A,3': { '2': 'H', '3': 'H', '4': 'H', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },//correct
    'A,4': { '2': 'H', '3': 'H', '4': 'D', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },//correct
    'A,5': { '2': 'H', '3': 'H', '4': 'D', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },//correct
    'A,6': { '2': 'H', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },//correct
    'A,7': { '2': 'Ds', '3': 'Ds', '4': 'Ds', '5': 'Ds', '6': 'Ds', '7': 'S', '8': 'S', '9': 'H', '10': 'H', 'A': 'H' },//correct
    'A,8': { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'Ds', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' },//correct
    'A,9': { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' }//correct
  };

  private pairSplittingStrategy: { [key: string]: { [key: string]: string } } = {
    'A,A': { '2': 'Y', '3': 'Y', '4': 'Y', '5': 'Y', '6': 'Y', '7': 'Y', '8': 'Y', '9': 'Y', '10': 'Y', 'A': 'Y' },//correct
    '10,10': { '2': 'N', '3': 'N', '4': 'N', '5': 'N', '6': 'N', '7': 'N', '8': 'N', '9': 'N', '10': 'N', 'A': 'N' },//correct
    '9,9': { '2': 'Y', '3': 'Y', '4': 'Y', '5': 'Y', '6': 'Y', '7': 'N', '8': 'Y', '9': 'Y', '10': 'N', 'A': 'N' },//correct
    '8,8': { '2': 'Y', '3': 'Y', '4': 'Y', '5': 'Y', '6': 'Y', '7': 'Y', '8': 'Y', '9': 'Y', '10': 'Y', 'A': 'Y' },//correct
    '7,7': { '2': 'Y', '3': 'Y', '4': 'Y', '5': 'Y', '6': 'Y', '7': 'Y', '8': 'N', '9': 'N', '10': 'N', 'A': 'N' },//correct
    '6,6': { '2': 'YN', '3': 'Y', '4': 'Y', '5': 'Y', '6': 'Y', '7': 'N', '8': 'N', '9': 'N', '10': 'N', 'A': 'N' },//correct
    '5,5': { '2': 'N', '3': 'N', '4': 'N', '5': 'N', '6': 'N', '7': 'N', '8': 'N', '9': 'N', '10': 'N', 'A': 'N' },//correct
    '4,4': { '2': 'N', '3': 'N', '4': 'N', '5': 'YN', '6': 'YN', '7': 'N', '8': 'N', '9': 'N', '10': 'N', 'A': 'N' },//correct
    '3,3': { '2': 'YN', '3': 'YN', '4': 'Y', '5': 'Y', '6': 'Y', '7': 'Y', '8': 'N', '9': 'N', '10': 'N', 'A': 'N' },//correct
    '2,2': { '2': 'YN', '3': 'YN', '4': 'Y', '5': 'Y', '6': 'Y', '7': 'Y', '8': 'N', '9': 'N', '10': 'N', 'A': 'N' }//correct
  };

  

  constructor(private BlackjackService: Blackjack) { }

  ngOnInit(): void {
    this.initializePractice();
  }

  initializePractice() {
    this.deck = this.BlackjackService.initDeck();
    this.shoe = this.BlackjackService.initShoe(6, this.deck);
    this.shoe = this.BlackjackService.splitShoe(this.shoe, 70);
    
    this.dealNewHand();
  }

  practiceSet(modeChoice: string){
    this.practiceMode = modeChoice;
    //After change of mode hand is dealt againg
    this.dealNewHand();
  }

  
dealNewHand() {
  this.playerHand = new Hand([], 0);
  this.dealerHand = [];

  // Check in case of split mode
  if (this.practiceMode == "same") {
    this.playerHand.Hit(this.dealCard()); 
    this.playerHand.Hit(this.playerHand.cards[0]);
  } else {
    // Deal two cards to player
    this.playerHand.Hit(this.dealCardWithSettings()); // deals card and checks if the card can be dealt to the player
    this.playerHand.Hit(this.dealCard()); 
  }
  
  // Deal one up card to dealer
  this.dealerUpCard = this.dealCard();
  this.dealerHand = [this.dealerUpCard];
  
  this.practiceState = 'decision';
  this.playerAction = '';
  this.correctAction = '';
  this.feedback = '';
  this.isCorrect = false;
}

dealCardWithSettings(): Card { // Fixed: added return type
  let ready: boolean = false; // Fixed: typo "redy" -> "ready"
  let card: Card; // Declare card outside the loop
  card = this.dealCard();

  while (!ready) {
    // Deals card initially
    card = this.dealCard();

    // Based on the settings changes the card dealt
    switch (this.practiceMode) {
      case "all":
        ready = true;
        break; // Added break statement
      case "hard":
        if (card.rank == "Ace") {
          // Continue loop to deal another card
          break;
        } else {
          ready = true;
        }
        break;
      case "soft":
        if (card.rank != "Ace") {
          // Continue loop to deal another card
          break;
        } else {
          ready = true;
        }
        break;
    }
  }
  
  return card; // Return the final card
}

dealCard(): Card {
  if (this.shoe.length === 0) {
    this.initializePractice();
    throw new Error('No more cards in the shoe');
  }
  return this.shoe.pop()!;
}
  makeDecision(action: string) {
    if (this.practiceState !== 'decision') return;
    
    this.playerAction = action;
    this.correctAction = this.getCorrectAction();
    this.isCorrect = this.playerAction === this.correctAction;
    
    this.totalCount++;
    if (this.isCorrect) {
      this.correctCount++;
    }
    
    this.generateFeedback();
    this.practiceState = 'feedback';
  }

  getCorrectAction(): string {
    const dealerUpValue = this.getDealerUpCardValue();
    
    // Check for pairs first
    if (this.canSplit()) {
      const pairKey = this.getPairKey();
      if (this.pairSplittingStrategy[pairKey] && this.pairSplittingStrategy[pairKey][dealerUpValue]) {
        const splitAction = this.pairSplittingStrategy[pairKey][dealerUpValue];
        if (splitAction === 'Y') return 'SPLIT';
        if (splitAction === 'YN' && this.dasAlloowed == true) {
          return 'SPLIT';
        }// Split if DAS allowed, otherwise hit/stand
      }
    }
    
    // Check for soft totals
    if (this.playerHand.isSoft()) {
      const softKey = this.getSoftKey();
      if (this.softTotalStrategy[softKey] && this.softTotalStrategy[softKey][dealerUpValue]) {
        const softAction = this.softTotalStrategy[softKey][dealerUpValue];
        if (softAction === 'H') return 'HIT';
        if (softAction === 'S') return 'STAND';
        if (softAction === 'D') return 'DOUBLE';
        if (softAction === 'Ds') return 'DOUBLE'; // Double if allowed, otherwise stand
      }
    }
    
    // Hard totals
    const hardTotal = Math.min(this.playerHand.handSum, 17).toString();
    if (this.hardTotalStrategy[hardTotal] && this.hardTotalStrategy[hardTotal][dealerUpValue]) {
      const hardAction = this.hardTotalStrategy[hardTotal][dealerUpValue];
      if (hardAction === 'H') return 'HIT';
      if (hardAction === 'S') return 'STAND';
      if (hardAction === 'D') return 'DOUBLE';
    }
    
    // Default fallback
    return this.playerHand.handSum < 17 ? 'HIT' : 'STAND';
  }

  getDealerUpCardValue(): string {
    if (!this.dealerUpCard) return '2';
    if (this.dealerUpCard.value === 11) return 'A';
    if (this.dealerUpCard.value === 10) return '10';
    return this.dealerUpCard.value.toString();
  }

  canSplit(): boolean {
    if (this.playerHand.cards.length !== 2) return false;
    const card1 = this.playerHand.cards[0];
    const card2 = this.playerHand.cards[1];
    
    // Check for same rank
    const value1 = card1.value === 11 ? 11 : (card1.value >= 10 ? 10 : card1.value);
    const value2 = card2.value === 11 ? 11 : (card2.value >= 10 ? 10 : card2.value);
    
    return value1 === value2;
  }

  getPairKey(): string {
    const card1 = this.playerHand.cards[0];
    const card2 = this.playerHand.cards[1];
    
    if (card1.value === 11) return 'A,A';
    if (card1.value >= 10) return '10,10';
    
    return `${card1.value},${card1.value}`;
  }

  getSoftKey(): string {
    const cards = this.playerHand.cards;
    if (cards.length !== 2) return 'A,2';
    
    const aceCard = cards.find(c => c.value === 11);
    const otherCard = cards.find(c => c.value !== 11);
    
    if (!aceCard || !otherCard) return 'A,2';
    
    const otherValue = otherCard.value >= 10 ? 10 : otherCard.value;
    return `A,${otherValue}`;
  }

  generateFeedback() {
    const situation = this.getHandDescription();
    const correctActionText = this.getActionDescription(this.correctAction);
    const playerActionText = this.getActionDescription(this.playerAction);
    
    if (this.isCorrect) {
      this.feedback = `✅ Correct! With ${situation} vs dealer ${this.getDealerUpCardValue()}, ${correctActionText} is the optimal play.`;
    } else {
      this.feedback = `❌ Incorrect. With ${situation} vs dealer ${this.getDealerUpCardValue()}, you should ${correctActionText}, not ${playerActionText}.`;
    }
  }

  getHandDescription(): string {
    if (this.canSplit()) {
      const card = this.playerHand.cards[0];
      const value = card.value === 11 ? 'A' : (card.value >= 10 ? '10' : card.value.toString());
      return `pair of ${value}s`;
    }
    
    if (this.playerHand.isSoft()) {
      return `soft ${this.playerHand.handSum}`;
    }
    
    return `hard ${this.playerHand.handSum}`;
  }

  getActionDescription(action: string): string {
    switch (action) {
      case 'HIT': return 'hit';
      case 'STAND': return 'stand';
      case 'DOUBLE': return 'double down';
      case 'SPLIT': return 'split';
      case 'SURRENDER': return 'surrender';
      default: return action.toLowerCase();
    }
  }

  nextHand() {
    this.dealNewHand();
  }

  resetStats() {
    this.correctCount = 0;
    this.totalCount = 0;
  }

  // Helper functions for template
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

  getCardSuitIcon(suit: string): string {
    switch (suit) {
      case 'spades': return '♠';
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      default: return suit;
    }
  }

  get accuracyPercentage(): number {
    return this.totalCount === 0 ? 0 : Math.round((this.correctCount / this.totalCount) * 100);
  }

  get canMakeDecision(): boolean {
    return this.practiceState === 'decision';
  }

  get showFeedback(): boolean {
    return this.practiceState === 'feedback';
  }
}