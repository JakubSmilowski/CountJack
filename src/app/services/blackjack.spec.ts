import { TestBed } from '@angular/core/testing';

import { Blackjack } from './blackjack';

describe('Blackjack', () => {
  let service: Blackjack;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Blackjack);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
