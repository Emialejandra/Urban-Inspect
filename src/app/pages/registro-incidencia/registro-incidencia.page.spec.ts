import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroIncidenciaPage } from './registro-incidencia.page';

describe('RegistroIncidenciaPage', () => {
  let component: RegistroIncidenciaPage;
  let fixture: ComponentFixture<RegistroIncidenciaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroIncidenciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
