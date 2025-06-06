import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { BlackJackComponet } from './pages/blackjack/blackjack';
import { Settings } from './pages/settings/settings';
import { Stats } from './pages/stats/stats';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'blackjack', component: BlackJackComponet },
  { path: 'settings', component: Settings },
  { path: 'stats', component: Stats },
  { path: 'login', component: Login },
];
