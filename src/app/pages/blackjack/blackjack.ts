import { Component, importProvidersFrom, OnInit } from '@angular/core';
import { Blackjack } from '../../services/blackjack';
import { Injectable } from '@angular/core';
import { on } from 'events';
import { Card } from '../../models/card';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { Hand } from '../../models/hand';
import { leadingComment } from '@angular/compiler';
import { delay } from 'rxjs';

@Component({
  selector: 'app-blackjack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blackjack.html',
  styleUrls: ['./blackjack.css']  // poprawka: musi być 'styleUrls'
})
export class BlackJackComponet  implements OnInit {
  deck: Card[] = [];
  shoe: Card[] = [];
  hands: Hand[] = [];
  startingHand: Card[] = [];
  handsNumber = 0;

  dealerHand: Card[] = [];

  globalState: string = '';
  playing: boolean = false;

  bankrol: number = 1000;
  runningCount: number = 0;

 

  ngOnInit(): void {
    this.startBlackJack(); //can take settings in the future.
    
  }
  
  constructor( private BlackjackService: Blackjack) { }



  startBlackJack() { 
    this.playing = true;
    this.globalState = 'Round'; 
    
    //Initialize the deck
    this.deck = this.BlackjackService.initDeck();
    
    //Initialize the shoe and split it
    this.shoe = this.BlackjackService.initShoe(1, this.deck);
    this.shoe = this.BlackjackService.splitShoe(this.shoe, 70);
    //Check for blackjack on the starting
    
    // Wait for player bet

    // Deal the hands

    // If both states on the hands are 'done' then end or play dealer hand.

    //Check who won and update the bankroll

    console.log(this.globalState); 
    console.log(this.hands);

  }
  //Deal a card from the sorted shoe 
  dealCard(): Card {
    if (this.shoe.length === 0) {
      throw new Error('No more cards in the shoe');
    }
    const card = this.shoe.pop();
    return card!;
  }

  //Bet function
  bet(amount: number) {
    //Iterate through the starting hand and deals two cards
    //Has to be changed to deal for dealer and player one by one
    if (amount > this.bankrol) {
      console.log('Not enough money');
      //Make this visible at UI
      return;
    }
   this.BetBankroll(amount);

   //Deals to the player and to the dealer
   this.DealHands(amount);
  }


  //Deals both to the dealer annd the player
  DealHands(amount: number) {
  const playerCard1 = this.dealCard();
  const dealerCard1 = this.dealCard();
  const playerCard2 = this.dealCard();
  const dealerCard2 = this.dealCard();

  this.startingHand.push(playerCard1, playerCard2);
  this.dealerHand.push(dealerCard1, dealerCard2);

 if (this.startingHand.length > 0) {
    const hand = new Hand(this.startingHand, amount);
    this.hands.push(hand);

    if (hand.isBlackjack()) {
      hand.state = 'blackjack';
      this.bankrol += amount * 1.5;
    }

    this.handsNumber++;
    this.startingHand = [];
  }

}
  //Deducts the bet from the bankroll;
  BetBankroll(amount: number){
    this.bankrol -= amount;
  }

  Reset(){
    this.hands = [];
    this.startingHand = [];
    this.dealerHand = [];
    this.handsNumber = 0;
    this.runningCount = 0;
  }

  Stand(id: number){
    //Calls the function on the object to stand.
    this.hands[id].Stand();
    this.checkAllHandsDone();
  }
  Hit(id: number){
    this.hands[id].Hit(this.dealCard());
    if(this.hands[id].isBusted()){
      this.hands[id].state = 'stand';
      this.checkAllHandsDone();
    }
  }
  Split(id: number){
    //Split is as future improvement for now
  }
  DoubleDown(id: number){
    //Doubles the bet
    this.BetBankroll(this.hands[id].betAmount /2)
    //Calls the function on the object to double down
    this.hands[id].DoubleDown();
    this.hands[id].Hit(this.dealCard());
  }
  Surrender(id: number){
    //Calls the function on the object to surrender
     this.hands[id].surrender();
    }


  ///Does not work really just yet
  checkAllHandsDone() {
    const allDone = this.hands.every(h => h.state === 'stand');
    if (allDone) {
      this.playDealer();
    }
  }

  playDealer() {
    while (this.calculateHandValue(this.dealerHand) < 17) {
      this.dealerHand.push(this.dealCard());  
    }
    this.endRound();
    delay(1000);
    this.Reset();
  }

  endRound() {
    const dealerValue = this.calculateHandValue(this.dealerHand);

    for (let hand of this.hands) {
      const playerValue = hand.handSum; // używamy gotowej wartości z obiektu Hand

      if (hand.isBusted()) {
        // przegrana
      } else if (dealerValue > 21 || playerValue > dealerValue) {
        this.bankrol += hand.playerWinLoss(true); // wygrana
      } else if (playerValue < dealerValue) {
        hand.playerWinLoss(false); // przegrana
      } else {
        this.bankrol += hand.betAmount; // remis, gracz dostaje stawkę z powrotem
      }
    }

    this.playing = false;
    this.globalState = 'end';
  }

  calculateHandValue(hand: Card[]): number {
    return hand.reduce((total, card) => total + card.value, 0);
  }

 
    
}
