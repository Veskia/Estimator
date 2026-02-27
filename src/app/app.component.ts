import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';

// PrimeNG Imports
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';

import { LoginService } from './services/login.service';
import { FeedbackComponent } from './feedback/feedback.component'; // Ensure path is correct

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TabMenuModule, FeedbackComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    private loginService = inject(LoginService);

    // State Signals
    userLevel = signal<string>('guest');
    firstName = signal<string>('');
    menuItems = signal<MenuItem[]>([]);
    activeItem = signal<MenuItem | undefined>(undefined);

    ngOnInit() {
        this.loginService.getLogin().subscribe({
            next: (login) => {
                this.userLevel.set(login.level);
                if (this.userLevel() !== 'guest') {
                    this.firstName.set(login.firstName);
                    this.generateMenu();
                } else {
                    // Redirect to legacy login if session is invalid
                    window.location.replace("https://signsinfo.com/homepage.php");
                }
            },
            error: (err) => console.error("Error getting login information.", err)
        });
    }

    generateMenu() {
        const level = this.userLevel();
        const items: MenuItem[] = [];

        // Define permissions logic
        const canSeeForm = !['operator', 'inventory'].includes(level);
        const canSeeMaterials = ['admin', 'superadmin', 'manager', 'salesgh', 'brunsadmin'].includes(level);
        const canSeeFinishing = ['admin', 'superadmin', 'manager', 'salesgh'].includes(level);
        const canSeeHistory = !['operator', 'inventory'].includes(level);
        const canSeeUsers = ['admin', 'superadmin', 'brunsadmin'].includes(level);
        const canSeeRequests = ['admin', 'superadmin', 'brunsadmin'].includes(level);
        const canSeeCapacity = ['admin', 'superadmin', 'manager', 'operator'].includes(level);
        const canSeeInventory = ['admin', 'superadmin', 'manager', 'inventory'].includes(level);
        const canSeeChangelog = ['admin', 'superadmin'].includes(level);

        // Build the menu array
        if (canSeeForm) items.push({ label: 'Form', routerLink: 'form' });
        if (canSeeMaterials) items.push({ label: 'Materials', routerLink: 'materials' });
        if (canSeeFinishing) items.push({ label: 'Finishing', routerLink: 'finishing' });
        if (canSeeHistory) items.push({ label: 'History', routerLink: 'history' });
        if (canSeeUsers) items.push({ label: 'Users', routerLink: 'users' });
        if (canSeeRequests) items.push({ label: 'Requests', routerLink: 'requests' });
        if (canSeeCapacity) items.push({ label: 'Capacity', routerLink: 'capacity' });
        if (canSeeInventory) items.push({ label: 'Inventory', routerLink: 'inventory' });
        if (canSeeChangelog) items.push({ label: 'Changelog', routerLink: 'changelog' });

        this.menuItems.set(items);
        this.activeItem.set(items[0]);
    }

    logout() {
        this.loginService.logout().subscribe({
            next: () => window.location.replace('http://signsinfo.com/login.php'),
            error: (err) => console.error("Logout failed", err)
        });
    }
}