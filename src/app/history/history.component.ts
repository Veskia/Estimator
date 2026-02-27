import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { SelectItem } from 'primeng/api';
import { HistoryService } from '../services/history.service';
import { LoginService } from '../services/login.service';
import { Estimate } from '../models/estimate';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, MultiSelectModule, DropdownModule, InputTextModule, KeyFilterModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  private historyService = inject(HistoryService);
  private loginService = inject(LoginService);
  private router = inject(Router);

  userLevel = signal<string | undefined>(undefined);
  cols: any[] = [];
  selectedColumns: any[] = [];
  companies: SelectItem[] = [];
  selectedCompany = signal<string>('all');
  totalRecords = signal<number>(0);
  estimates = signal<Estimate[]>([]);
  loading = signal<boolean>(true);
  showTable = signal<boolean>(true);
  booleanOptions: SelectItem[] = [];

  ngOnInit() {
    this.loginService.getLogin().subscribe({
      next: (login) => {
        this.userLevel.set(login.level);
        if (login.level === 'guest') this.router.navigate(['/login']);
        this.generateCols();
      }
    });
    this.companies = [{label: 'All Companies', value: 'all'}, {label: 'GH Imaging', value: 'gh'}, {label: 'BigSigns', value: 'bigsigns'}, {label: 'Brunswick', value: 'brunswick'}];
    this.booleanOptions = [{ label: 'All', value: null }, { label: 'Yes', value: 1 }, { label: 'No', value: 0 }];
    this.getTotalRecordCount();
  }

  generateCols() {
    if (['admin', 'superadmin', 'manager', 'brunsadmin'].includes(this.userLevel()!)) {
      this.cols.push({field: 'userEmail', header: 'User'});
      this.selectedColumns.push({field: 'userEmail', header: 'User'});
    }
    this.cols.push({field: 'materialName', header: 'Material'}, {field: 'finishingName', header: 'Finishing'}, {field: 'laminate', header: 'Laminate'}, {field: 'diecut', header: 'Diecut'}, {field: 'quantity', header: 'Quantity'}, {field: 'height', header: 'Height'}, {field: 'width', header: 'Width'}, {field: 'price', header: 'Price'}, {field: 'dateSubmitted', header: 'Date Submitted'});
    this.selectedColumns.push({field: 'materialName', header: 'Material'}, {field: 'quantity', header: 'Quantity'}, {field: 'price', header: 'Price'}, {field: 'dateSubmitted', header: 'Date Submitted'});
  }

  getTotalRecordCount(userEmail = '', materialName = '', finishingName = '', laminate = null, diecut = null) {
    this.historyService.getHistoryCount(this.selectedCompany(), userEmail, materialName, finishingName, laminate, diecut, '', '', '', '', '', '', '', '', '')
      .subscribe(res => this.totalRecords.set(res.totalRecords));
  }

  loadEstimatesLazy(event: any) {
    this.loading.set(true);
    const filters = event.filters || {};
    const getF = (name: string) => filters[name]?.value || '';
    
    // Fixed: Adjusted the number of empty strings to exactly match the 17 expected arguments.
    this.historyService.getEstimates(event.first || 0, event.rows || 20, this.selectedCompany(), getF('userEmail'), getF('materialName'), getF('finishingName'), filters['laminate']?.value, filters['diecut']?.value, '', '', '', '', '', '', '', '', '')
      .subscribe(est => { this.estimates.set(est); this.loading.set(false); });
  }

  displayData(rowData: any, field: string) {
    if (['userEmail', 'dateSubmitted'].includes(field)) return rowData.order ? rowData.order[field] : '';
    if (field === 'laminate' || field === 'diecut') return rowData[field] === 1 ? 'Yes' : 'No';
    return rowData[field];
  }
}