import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { KeyFilterModule } from 'primeng/keyfilter';

import { FinishingService } from '../services/finishing.service';
import { LoginService } from '../services/login.service';
import { Finishing } from '../models/finishing'; 

@Component({
  selector: 'app-finishing',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, 
    DropdownModule, CheckboxModule, DialogModule, ConfirmDialogModule, 
    ToastModule, KeyFilterModule
  ],
  templateUrl: './finishing.component.html',
  styleUrls: ['./finishing.component.css']
})
export class FinishingComponent implements OnInit {
  private finishingService = inject(FinishingService);
  private loginService = inject(LoginService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  userLevel = signal<string | undefined>(undefined);
  selectedCompany = signal<string>('gh');
  addFinishingDialog = signal<boolean>(false);
  loading = signal<boolean>(true);
  allFinishing = signal<Finishing[]>([]);
  
  filteredFinishing = computed(() => {
    return this.allFinishing().filter(f => f.company === this.selectedCompany());
  });

  newFinishing: Partial<Finishing> = { company: 'gh' };
  companies: SelectItem[] = [
    {label: "GH Imaging", value: "gh"},
    {label: "BigSigns", value: "bigsigns"},
    {label: "Brunswick", value: "brunswick"}
  ];

  ngOnInit() {
    this.loginService.getLogin().subscribe({
      next: (login) => {
        this.userLevel.set(login.level);
        if (login.level === 'guest') this.router.navigate(['/login']);
        if (login.level === 'manager' || login.level === 'bigsigns') {
          this.selectedCompany.set('bigsigns');
          this.newFinishing.company = 'bigsigns';
        }
        this.loadFinishing();
      },
      error: (err) => console.error("Error getting login info", err)
    });
  }

  loadFinishing(): void {
    this.loading.set(true);
    this.finishingService.getFinishing().subscribe({
      next: (finishing) => {
        this.allFinishing.set(finishing);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  changeCompany(event: any): void {
    this.selectedCompany.set(event.value);
    this.newFinishing.company = event.value;
  }

  editCell(finishing: Finishing, field: string, data: any): void {
    const value = data === "" ? null : data;
    this.finishingService.updateCell(finishing.id, field, value).subscribe({
      error: (err) => console.error("Error updating finishing cell", err)
    });
  }

  clickActive(finishing: Finishing): void {
    finishing.active = !finishing.active;
    this.editCell(finishing, "active", finishing.active);
  }

  delete(finishing: Finishing): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${finishing.name}?`,
      header: 'Delete Confirmation',
      accept: () => {
        this.finishingService.deleteFinishing(finishing.id).subscribe({
          next: () => {
            this.allFinishing.update(arr => arr.filter(f => f.id !== finishing.id));
            this.messageService.add({severity: 'success', summary: 'Success', detail: `${finishing.name} deleted.`});
          },
          error: (err) => console.error(err)
        });
      }
    });
  }

  submitNewFinishing(finishing: Partial<Finishing>): void {
    this.finishingService.addFinishing(finishing as Finishing).subscribe({
      next: () => {
        this.addFinishingDialog.set(false);
        this.messageService.add({severity: 'success', summary: 'Success', detail: `${finishing.name} added.`});
        this.newFinishing = { company: this.selectedCompany() }; 
        this.loadFinishing(); 
      },
      error: (err) => console.error(err)
    });
  }

  finishingComplete(f: Partial<Finishing>): boolean {
    return !!(f.name && f.c8 !== undefined && f.c20 !== undefined && f.c21 !== undefined);
  }

  downloadCSV() {
    this.finishingService.getFinishingCSV().subscribe({
      next: (response) => window.location.href = `https://signsinfo.com/backend/api/${response}`,
      error: (err) => console.error(err)
    });
  }
}