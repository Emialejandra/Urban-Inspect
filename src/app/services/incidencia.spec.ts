import { TestBed } from '@angular/core/testing';
import { Incidencia } from './incidencia';

describe('Incidencia', () => {
  let service: Incidencia;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Incidencia);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
