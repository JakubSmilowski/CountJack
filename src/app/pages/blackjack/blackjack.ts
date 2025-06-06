import { Component, OnInit } from '@angular/core';
import { Blackjack } from '../../services/blackjack';
import { Injectable } from '@angular/core';
import { on } from 'events';
@Component({
  selector: 'app-blackjack',
  imports: [],
  templateUrl: './blackjack.html',
  styleUrl: './blackjack.css'
})
export class blackjack  implements OnInit {

  ngOnInit(): void {
    this.BlackjackService.initDeck();
  }
  
  constructor( private BlackjackService: Blackjack) { }

  
}
