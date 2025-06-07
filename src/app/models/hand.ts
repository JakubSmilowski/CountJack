import { Card } from './card';

export class Hand {
    public cards: Card[] = [];
    public betAmount: number = 0;
    public state: string = '';
    public handSum: number = 0;
    public busted: boolean = false;

    constructor(cards: Card[], betAmount: number, state: string = '') {
        this.cards = cards;
        this.betAmount = betAmount;
        this.state = state;
        this.updateValue();
    }

    // Bets
    public Bet(amount: number) {
        this.state = 'start';
        this.betAmount += amount;
        this.updateValue();
    }

    // Hits
    public Hit(card: Card) { 
        if (this.checkState()) {
            this.cards.push(card);
            this.updateValue();
            console.log(this.cards);
        } else {
            return console.log('Already stood on this hand!');
        }
    }

    // Stands
    public Stand() {
        if (this.checkState()) {
            this.state = 'stand';
        } else {
            return console.log('Already stood on this hand!');
        }
    }

    // Double Down Logic - Modified to NOT draw a card (component handles this)
    public DoubleDown() {
        if (this.checkState()) {
            // Double the bet amount
            this.betAmount *= 2;
            // Set state to stand (after component draws the card)
            this.state = 'stand';
            this.updateValue();
        } else {
            return console.log('Already stood on this hand!');
        }
    }

    public surrender() {
        if (this.checkState()) {
            // bet amount is deducted by half
            this.betAmount = this.betAmount * 0.5;
            this.state = 'surrender';
        } else {
            return console.log('Already stood on this hand!');
        }
    }   

    public reset() {
        this.state = '';
        this.cards = [];
        this.betAmount = 0;
        this.handSum = 0;
        this.busted = false;
    }

    // Blackjack logic ====================================
    
    // Update the value of the hand with proper Ace handling
    public updateValue(): void {
        let value = 0;
        let aces = 0;

        // Count all cards and track aces
        for (const card of this.cards) {
            if (card.value === 11) { // Ace
                aces++;
                value += 11;
            } else {
                value += card.value;
            }
        }

        // Convert Aces from 11 to 1 if necessary
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }

        this.handSum = value;
        
        // Update busted status
        if (this.handSum > 21) {
            this.busted = true;
            this.state = 'busted';
        }
    }

    public isBusted(): boolean {
        return this.handSum > 21;
    }

    // Returns the accurate bet amount based on win or loss
    public playerWinLoss(winLoss: boolean): number {
        // Check if user won!
        if (winLoss) {
            this.betAmount *= 2;
        } else {
            this.betAmount = 0;
        }
        return this.betAmount;
    }
    
    // Check if blackjack
    public isBlackjack(): boolean {
        return this.handSum === 21 && this.cards.length === 2;
    }

    // Check if hand is soft (contains an Ace counted as 11)
    public isSoft(): boolean {
        let value = 0;
        let hasUsableAce = false;

        for (const card of this.cards) {
            if (card.value === 11) {
                if (value + 11 <= 21) {
                    hasUsableAce = true;
                    value += 11;
                } else {
                    value += 1;
                }
            } else {
                value += card.value;
            }
        }

        return hasUsableAce && value <= 21;
    }

    // Check if hand can be split
    public canSplit(): boolean {
        if (this.cards.length !== 2) return false;
        
        // Check if both cards have same rank value
        const card1Value = this.cards[0].value === 11 ? 11 : (this.cards[0].value >= 10 ? 10 : this.cards[0].value);
        const card2Value = this.cards[1].value === 11 ? 11 : (this.cards[1].value >= 10 ? 10 : this.cards[1].value);
        
        return card1Value === card2Value;
    }

    // Get hand description for display
    public getHandDescription(): string {
        if (this.isBlackjack()) return 'Blackjack!';
        if (this.isBusted()) return 'Busted';
        if (this.isSoft()) return `Soft ${this.handSum}`;
        return `${this.handSum}`;
    }

    // State checking function - returns true if it's possible to make action on the hand 
    // E.g hit or double down
    private checkState(): boolean {
        switch (this.state) {
            case 'stand':
            case 'busted':
            case 'blackjack':
            case 'surrender':
                return false;
            case 'hit':
            case 'split':
            case '':
            default:
                return true;
        }
    }
}