import { bootstrapApplication } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  alertCircleOutline,
  arrowForwardOutline,
  bookmarkOutline,
  chevronForwardOutline,
  documentTextOutline,
  homeOutline,
  listOutline,
  locateOutline,
  locationOutline
} from 'ionicons/icons';
import {
  RouteReuseStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  PreloadAllModules
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

addIcons({
  'add-circle-outline': addCircleOutline,
  'alert-circle-outline': alertCircleOutline,
  'arrow-forward-outline': arrowForwardOutline,
  'bookmark-outline': bookmarkOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'document-text-outline': documentTextOutline,
  'home-outline': homeOutline,
  'list-outline': listOutline,
  'locate-outline': locateOutline,
  'location-outline': locationOutline
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding()
    ),
    provideHttpClient()
  ],
});
