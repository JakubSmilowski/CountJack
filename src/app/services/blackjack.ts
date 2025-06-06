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
  // shoe: Card[] = [];
  playerHand: [] = [];
  dealerHand: [] = [];

  ngOnInit(): void {

  }
 
   public initDeck(): Card[] {
    const suits: CardSuit[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const ranks: CardRank[] = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];

    this.deck = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        this.deck.push(new Card(suit, rank));
      }
    }
    return this.deck;
  }


  initShoe(numerOfDecks: number, deck: Card[]) {
    // Logic for initializing the deck
    // User can chose what deck size, after that shuffle the deck

    for (let i = 0; i < numerOfDecks; i++) {
      this.shuffle(this.deck);
      this.shoe.push(...this.deck);
    }
    return this.shoe;
   }

   shuffle(deck: Card[]) {
    // Logic for shuffling the deck
    deck.sort(() => Math.random() - 0.5);
     
   }

   splitShoe(shoe: Card[], splitPercentage: number) {
    // Logic for splitting the shoe
    let shoeSplitNumber = 1 - (splitPercentage /100);
    //Get number of cards in a shoe
    let shoecount: number = shoe.length-1;

    // calculate how many cards to pop from the shoe
    let popNumber = shoecount * shoeSplitNumber;

    // pop the cards from the shoe

    for (let i = 0 ; i < Math.floor(popNumber); i++) {
      shoe.pop();
    }

    console.log(shoe.length);

    return shoe;
   }

   



}
