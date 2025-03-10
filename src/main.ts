import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { defineCustomElements } from '@npm-bbta/bbog-dig-dt-sherpa-lib/loader';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';

defineCustomElements();

bootstrapApplication(AppComponent, {...appConfig,
  providers:[
    provideHttpClient(withInterceptors([authInterceptor])),
    ...appConfig.providers
  ]
})
  .catch((err) => console.error(err));
  

