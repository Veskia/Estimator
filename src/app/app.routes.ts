import { Routes } from '@angular/router';
import { EstimatorComponent } from './estimator/estimator.component';
import { HistoryComponent } from './history/history.component';
import { MaterialsComponent } from './materials/materials.component';
import { FinishingComponent } from './finishing/finishing.component';
import { UsersComponent } from './users/users.component';
import { RequestsComponent } from './requests/requests.component';
import { CapacityComponent } from './capacity/capacity.component';
import { InventoryComponent } from './inventory/inventory.component';
import { ChangelogComponent } from './changelog/changelog.component';
import { ReviewComponent } from './review/review.component';

export const routes: Routes = [
    { path: '', redirectTo: 'form', pathMatch: 'full' },
    { path: 'form', component: EstimatorComponent },
    { path: 'review', component: ReviewComponent },
    { path: 'history', component: HistoryComponent },
    { path: 'materials', component: MaterialsComponent },
    { path: 'finishing', component: FinishingComponent },
    { path: 'users', component: UsersComponent },
    { path: 'requests', component: RequestsComponent },
    { path: 'capacity', component: CapacityComponent },
    { path: 'inventory', component: InventoryComponent },
    { path: 'changelog', component: ChangelogComponent },
    { path: '**', redirectTo: 'form' }
];