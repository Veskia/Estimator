import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService, SelectItem } from 'primeng/api';

import { UserRequest } from '../models/user'; // Ensure this points to the right file
import { UserService } from '../services/user.service';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-requests',
  standalone: true,
  // Added the missing PrimeNG modules to the imports array
  imports: [
    CommonModule, 
    FormsModule, 
    TableModule, 
    DropdownModule, 
    ButtonModule, 
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {
  // Inject services
  private userService = inject(UserService);
  private loginService = inject(LoginService);
  private messageService = inject(MessageService);

  // Define Signals
  requests = signal<UserRequest[]>([]);
  userLevels = signal<SelectItem[]>([]);
  accessUserLevel = signal<string | undefined>(undefined);

  ngOnInit() {
    // Fetch the current user's login level first
    this.loginService.getLogin().subscribe({
      next: (login: any) => {
        this.accessUserLevel.set(login.level);
        this.setUserLevels();
        this.loadUserRequests();
      },
      error: (err: any) => console.error("Error getting login info", err)
    });
  }

  loadUserRequests() {
    this.userService.getUserRequests().subscribe({
      next: (requests: UserRequest[]) => {
        this.requests.set(requests);
      },
      error: (err: any) => {
        console.error("Error getting user requests:", err);
      }
    });
  }

  setUserLevels(): void {
    const level = this.accessUserLevel();
    if (level === 'admin' || level === 'superadmin') {
      this.userLevels.set([
        {label: "Sales GH", value: "salesgh"},
        {label: "GH Management", value: "ghmgmt"},
        {label: "BigSigns", value: "bigsigns"},
        {label: "Project Manager", value: "manager"},
        {label: "Admin", value: "admin"},
        {label: "Retail", value: "retail"},
        {label: "Operator", value: "operator"},
        {label: "Inventory", value: "inventory"},
        {label: "Brunswick Admin", value: "brunsadmin"},
        {label: "Brunswick User", value: "brunsuser"}
      ]);
    } else {
      this.userLevels.set([
        {label: "Brunswick Admin", value: "brunsadmin"},
        {label: "Brunswick User", value: "brunsuser"}
      ]);
    }
  }

  acceptUser(request: UserRequest) {
    this.userService.acceptUser(request.id, request.level).subscribe({
      next: () => {
        // Replaces lodash _.remove
        this.requests.update(reqs => reqs.filter(r => r.id !== request.id));
        this.messageService.add({
          severity: 'success', 
          summary: 'Success', 
          detail: `${request.firstName} ${request.lastName} added.`
        });
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({
          severity: 'error', 
          summary: 'Error', 
          detail: `Error adding ${request.firstName} ${request.lastName}`
        });
      }
    });
  }

  denyUser(request: UserRequest) {
    this.userService.denyUser(request.id).subscribe({
      next: () => {
        // Replaces lodash _.remove
        this.requests.update(reqs => reqs.filter(r => r.id !== request.id));
        this.messageService.add({
          severity: 'success', 
          summary: 'Success', 
          detail: `${request.firstName} ${request.lastName} denied.`
        });
      },
      error: (err: any) => {
        console.error("Error denying user", err);
        this.messageService.add({
          severity: 'error', 
          summary: 'Error', 
          detail: `Error denying ${request.firstName} ${request.lastName}`
        });
      }
    });
  }
} // Properly closes the class at the very end