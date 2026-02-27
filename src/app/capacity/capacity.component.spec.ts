import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacityComponent } from './capacity.component';

describe('CapacityComponent', () => {
  let component: CapacityComponent;
  let fixture: ComponentFixture<CapacityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapacityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CapacityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
