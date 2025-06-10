import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicStrategyPractice } from './basic-strategy-practice';

describe('BasicStrategyPractice', () => {
  let component: BasicStrategyPractice;
  let fixture: ComponentFixture<BasicStrategyPractice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicStrategyPractice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicStrategyPractice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
