import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComstatsComponent } from './comstats.component';

describe('ComstatsComponent', () => {
  let component: ComstatsComponent;
  let fixture: ComponentFixture<ComstatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComstatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComstatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
