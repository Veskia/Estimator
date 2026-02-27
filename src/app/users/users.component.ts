import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Standalone Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor'; 
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';

import { User } from '../models/user';
import { UserService } from '../services/user.service';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, 
    DropdownModule, MultiSelectModule, InputTextModule, EditorModule, 
    FileUploadModule, ToastModule, ConfirmDialogModule
  ],
  providers: [MessageService],
  templateUrl: './users.component.html', // Ensure this file exists in src/app/users/
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: FileUpload;

  private userService = inject(UserService);
  private loginService = inject(LoginService);
  private confirmationService = inject(ConfirmationService) as ConfirmationService;
  private messageService = inject(MessageService) as MessageService;

  // State Signals
  accessUserLevel = signal<string>('');
  userIdentity = signal<string>('');
  users = signal<User[]>([]);
  userLevels = signal<SelectItem[]>([]);
  userLevelChoices = signal<SelectItem[]>([]);

  // Email State Signals
  writingEmail = signal<boolean>(false);
  toLine = signal<string>('');
  subject = signal<string | null>(null);
  emailBody = signal<string>('');

  selectingUserGroups = signal<boolean>(false);
  selectedUserGroups = signal<string[]>([]);
  selectingCustomEmail = signal<boolean>(false);
  selectedCustomUsers = signal<User[]>([]);

  ngOnInit() {
    this.loginService.getLogin().subscribe({
      next: (login) => {
        this.userIdentity.set(login.email);
        this.accessUserLevel.set(login.level);
        if (login.level === 'guest') {
          window.location.replace('http://signsinfo.com/login.php');
        }
        this.setUserLevels();
      }
    });
    this.getUsers();
  }

  getUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => this.users.set(users)
    });
  }

  setUserLevels(): void {
    const level = this.accessUserLevel();
    const adminLevels: SelectItem[] = [
      {label: "Sales GH", value: "salesgh"}, {label: "GH Management", value: "ghmgmt"},
      {label: "BigSigns", value: "bigsigns"}, {label: "Project Manager", value: "manager"},
      {label: "Admin", value: "admin"}, {label: "Super Admin", value: "superadmin"},
      {label: "Retail", value: "retail"}, {label: "Operator", value: "operator"},
      {label: "Inventory", value: "inventory"}, {label: "Brunswick Admin", value: "brunsadmin"},
      {label: "Brunswick User", value: "brunsuser"}
    ];

    if (level === 'admin' || level === 'superadmin') {
      this.userLevels.set(adminLevels);
      this.userLevelChoices.set(level === 'superadmin' ? adminLevels : adminLevels.filter(l => l.value !== 'superadmin'));
    } else {
      const brunsLevels = [{label: "Brunswick Admin", value: "brunsadmin"}, {label: "Brunswick User", value: "brunsuser"}];
      this.userLevels.set(brunsLevels);
      this.userLevelChoices.set(brunsLevels);
    }
  }

  changeUserLevel(user: User): void {
    this.userService.changeUserLevel(user.id, user.level).subscribe();
  }

  deleteUser(user: User): void {
    this.confirmationService.confirm({
      message: `Remove ${user.firstName} ${user.lastName}?`,
      header: 'Delete Confirmation',
      accept: () => {
        this.userService.deleteUser(user.id).subscribe(() => {
          this.users.update(u => u.filter(item => item.id !== user.id));
          this.messageService.add({severity: 'success', summary: 'Success', detail: 'User removed.'});
        });
      }
    });
  }

  startEmailSend(): void {
    this.fileInput.upload();
  }

  sendEmail(event: any): void {
    const regex = /\[([^\]]+)\]/g;
    const recipients: string[] = [];
    let match;
    while ((match = regex.exec(this.toLine())) !== null) {
      recipients.push(match[1]);
    }

    const formData = new FormData();
    formData.append('recipients', JSON.stringify(recipients));
    formData.append('subject', this.subject() || '');
    formData.append('emailBody', JSON.stringify(this.emailBody()));
    
    for (let file of event.files) {
      formData.append('attachments[]', file);
    }

    this.userService.sendEmail(formData).subscribe(() => {
      this.writingEmail.set(false);
      this.messageService.add({severity: 'success', summary: 'Success', detail: "Email sent."});
      this.fileInput.clear();
    });
  }

  displayUserLevel(level: string): string {
    const map: Record<string, string> = { 'salesgh': 'Sales GH', 'manager': 'Project Manager', 'superadmin': 'Super Admin' };
    return map[level] || level.charAt(0).toUpperCase() + level.slice(1);
  }
}