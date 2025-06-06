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
      }


    //Bets
    public Bet(amount: number) {
        this.state = 'start';
        this.betAmount += amount;
        this.updateValue();
    }

    //hits
    public Hit(card: Card) { 
        if(this.checkState()){
            this.cards.push(card);
            this.updateValue();
            console.log(this.cards)
        }else
        return console.log('Alredy stood on this hand!');
        
        //increment number on hand after pushing
    }
    //Stands
    public Stand(){
        if(this.checkState()){
        this.state = 'stand'
        }else
        return console.log('Alredy stood on this hand!');
    }
    //dOUBLE LOGIC
    public DoubleDown() {
        if(this.checkState()){
            this.state = 'stand';
            //doubles the bet amount
            this.betAmount *= 2;  
            this.updateValue();
        }else
        return console.log('Alredy stood on this hand!');
    }

    public surrender(){
        if(this.checkState()){
            //bet amount is deducted by half
            this.betAmount = this.betAmount * 0.5;
            this.state = 'stand';
        }else
        return console.log('Alredy stood on this hand!');
    }   

    public reset() {
        this.state = '';
        this.cards = [];
        this.betAmount = 0;
    }

    //blackjack logic ====================================
    
    //Upadte the value of the hand
    public updateValue(): void {
      this.handSum = this.cards.reduce((total, card) => total + card.value, 0);
    }

    public isBusted(){
        // Check if user busted!
        if(this.handSum > 21){
            this.busted = true;
        }
        return this.busted;
    }

    //Returns the accureate bet amount based on win or loss
    public playerWinLoss(winLoss: boolean){
        // Check if user won!
        if(winLoss){
            this.betAmount *= 2;
        }else{
            this.betAmount = 0;
        }
        return this.betAmount;
    }
    
    //Check if blackjack
    public isBlackjack(){
        return this.handSum === 21 && this.cards.length === 2;
    }


    
    
    //State checking function - returns true if its possible to make action of the hand 
    //E.g hit or double down
    private checkState(){
        switch (this.state) {
            case 'stand':
                return false;
            case 'hit':
                return true;
            case 'split':
                return true;
            case '':
                return true;
            default:
                return false;
            }
    }
}
