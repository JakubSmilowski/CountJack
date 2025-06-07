import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
   showChartHelp = false;
  
  constructor() {}
  
  toggleChartHelp(): void {
    this.showChartHelp = !this.showChartHelp;
  }
  
  downloadChart(): void {
    // Implement chart download functionality
    console.log('Downloading strategy chart...');
    // You can add actual download logic here
  }
  
  startBasicTraining(): void {
    // Navigate to basic strategy trainer
    console.log('Starting basic strategy training...');
  }
  
  startCountingPractice(): void {
    // Navigate to card counting practice
    console.log('Starting card counting practice...');
  }
  
  startFullGame(): void {
    // Navigate to full game simulator
    console.log('Starting full game...');
  }
}
