import { TestBed } from '@angular/core/testing';

import { FinishingService } from './finishing.service';

describe('FinishingService', () => {
  let service: FinishingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinishingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
