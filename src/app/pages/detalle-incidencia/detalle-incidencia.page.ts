import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-detalle-incidencia',
  templateUrl: './detalle-incidencia.page.html',
  styleUrls: ['./detalle-incidencia.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class DetalleIncidenciaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
