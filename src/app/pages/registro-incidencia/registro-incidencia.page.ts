import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-registro-incidencia',
  templateUrl: './registro-incidencia.page.html',
  styleUrls: ['./registro-incidencia.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RegistroIncidenciaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
