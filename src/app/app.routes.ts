import { Routes } from '@angular/router';
import { EventFormComponent } from './event-form/event-form.component';
import { EventListComponent } from './event-list/event-list.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './interceptors/auth-guard.services';

export const routes: Routes = [

    { path: 'create-event', component: EventFormComponent, canActivate: [AuthGuard] },
    { path: 'fetch-events', component: EventListComponent, canActivate: [AuthGuard]  },
    { path: 'edit-event/:id', component: EventFormComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];

