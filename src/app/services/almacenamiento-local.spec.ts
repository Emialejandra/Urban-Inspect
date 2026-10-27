import { TestBed } from '@angular/core/testing';
import { AlmacenamientoLocal } from './almacenamiento-local';

describe('AlmacenamientoLocal', () => {
  let service: AlmacenamientoLocal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlmacenamientoLocal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
