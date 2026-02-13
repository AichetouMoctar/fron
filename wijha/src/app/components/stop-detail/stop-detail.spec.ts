import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopDetail } from './stop-detail';

describe('StopDetail', () => {
  let component: StopDetail;
  let fixture: ComponentFixture<StopDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StopDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StopDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
