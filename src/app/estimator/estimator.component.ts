import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG Imports
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DialogModule } from 'primeng/dialog';
import { SidebarModule } from 'primeng/sidebar';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FieldsetModule } from 'primeng/fieldset';
import { ToastModule } from 'primeng/toast';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MessageService, SelectItem } from 'primeng/api';

import { EstimatorService } from '../services/estimator.service';
import { MaterialsService } from '../services/materials.service';
import { FinishingService } from '../services/finishing.service';
import { LoginService } from '../services/login.service';
import { Material } from '../models/material';

@Component({
  selector: 'app-estimator',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, DropdownModule, CheckboxModule,
    RadioButtonModule, DialogModule, SidebarModule, CalendarModule, InputTextModule,
    ButtonModule, TooltipModule, FieldsetModule, ToastModule, KeyFilterModule
  ],
  providers: [MessageService],
  templateUrl: './estimator.component.html', // Fixed typo: was pointing to capacity.component.html
  styleUrls: ['./estimator.component.css']
})
export class EstimatorComponent implements OnInit {
  private estimatorService = inject(EstimatorService);
  private materialsService = inject(MaterialsService);
  private finishingService = inject(FinishingService);
  private loginService = inject(LoginService);
  private messageService = inject(MessageService);

  // Variables
  quantity: number | null = 1;
  height: number | null = null;
  width: number | null = null;
  manualScrap: number = 0;
  scrap: string = 'auto';
  estimateId: number | null = null;
  selectedUserView: string = 'guest';

  // Signals for state
  showSidebar = signal<boolean>(false);
  showModal = signal<boolean>(false);

  // Totals
  wholesaleTotal: number = 0;
  retailTotal: number = 0;
  sqFtEach: number = 0;
  sqFtBase: number = 0;
  lam: number = 0;
  lamScrap: number = 0;
  scrapCost: number = 0;

  ngOnInit() {
    this.loginService.getLogin().subscribe({
      next: (login: any) => {
        this.selectedUserView = login.level;
        if (this.estimateId) {
          this.loadEstimateDetails();
        }
      }
    });
  }

  loadEstimateDetails() {
    if (!this.estimateId) return;
    this.estimatorService.getEstimateDetails(this.estimateId).subscribe({
      next: (estimate: any) => {
        this.quantity = estimate.quantity || 1;
        this.height = estimate.height || 0;
        this.width = estimate.width || 0;
        this.calculateTotals();
      },
      error: (err: any) => console.error(err)
    });
  }

  calculateTotals() {
    const h = this.height || 0;
    const w = this.width || 0;
    const q = this.quantity || 0;

    this.sqFtEach = (h * w) / 144;
    this.sqFtBase = this.sqFtEach * q;
    
    // Add logic for pricing multipliers and finishing here
    const baseEa = (this.sqFtEach || 0) * (this.sqFtBase || 0);
    this.wholesaleTotal = (this.scrapCost || 0) + (this.lam || 0) + (this.lamScrap || 0) + baseEa;
    this.retailTotal = this.wholesaleTotal * 1.5;
  }

  quantityUpdate() { this.calculateTotals(); }
  heightWidthUpdate() { this.calculateTotals(); }
  completeUpdate() { this.calculateTotals(); }

  openModal(type: string) {
    this.showModal.set(true);
  }
}