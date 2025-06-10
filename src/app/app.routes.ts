import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { BlackJackComponent } from './pages/blackjack/blackjack';
import { Settings } from './pages/settings/settings';
import { Stats } from './pages/stats/stats';
import { Login } from './pages/login/login';
import { BasicStrategyPractice } from './pages/basic-strategy-practice/basic-strategy-practice';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'blackjack', component: BlackJackComponent },
  { path: 'practice', component: BasicStrategyPractice },
  { path: 'settings', component: Settings },
  { path: 'stats', component: Stats },
  { path: 'login', component: Login },
];
