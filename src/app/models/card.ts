export type CardSuit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
export type CardRank = 'Ace' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'Jack' | 'Queen' | 'King';

export class Card {
  public suit: CardSuit = 'Hearts';
  public rank: CardRank = 'Ace';
  constructor(cardSuit: CardSuit, cardRank: CardRank
  ) {
    this.suit = cardSuit;
    this.rank = cardRank;
   }

  get name(): string {
    return `${this.rank} of ${this.suit}`;
  }

  get value(): number {
    switch (this.rank) {
      case 'Ace': return 11;
      case 'Jack':
      case 'Queen':
      case 'King': return 10;
      default: return parseInt(this.rank, 10);
    }
  }
}