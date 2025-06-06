import { Injectable, OnInit } from '@angular/core';
import { Card, CardSuit, CardRank } from '../models/card';
import { Deck } from '../models/deck';
import {} from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class Blackjack implements OnInit {

  constructor() { }

  deck: Card[] = [];
  
  shoe: Card[] = [];

  playerHand: [] = [];
  dealerHand: [] = [];

  ngOnInit(): void {
    this.initDeck(); 
    this.shuffleDeck();
    this.initShoe(4);
  }
 
   initDeck(): void {
    const suits: CardSuit[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const ranks: CardRank[] = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];

    this.deck = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        this.deck.push(new Card(suit, rank));
      }
    }
    console.log(this.deck);
  }


  initShoe(numerOfDecks: number) {
    // Logic for initializing the deck
    // User can chose what deck size there is and what the split percentage is

   }

   shuffleDeck() {
    // Logic for shuffling the deck
     
   }

   dealHands() {
    // Logic for dealing the hands
   }

   hit() {
    // Logic for hitting or standing
   }

   stand() {
    // Logic for hitting or standing
   }

   split() {
    // Logic for splitting
   }

   doubleDown() {
    // Logic for doubling down
   }

   callculateWinLoss() {
    // Logic for calculating the win
   }

   countCards(playerHand: number[], dealerHand: number[]) {
    // Logic for counting the cards

   }  
   



}
