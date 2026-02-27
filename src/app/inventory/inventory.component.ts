import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InventoryService } from '../services/inventory.service';
import { Inventory } from '../models/inventory';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, InputTextarea, DropdownModule, CheckboxModule, DialogModule, ToastModule],
  providers: [MessageService],
  templateUrl: './inventory.component.html'
})
export class InventoryComponent implements OnInit {
  
  private inventoryService = inject(InventoryService);
  private messageService = inject(MessageService) as MessageService;
  inventoryItems = signal<Inventory[]>([]);
  addInventoryDialog = signal<boolean>(false);
  newInventory = signal<Partial<Inventory>>({});
  updateNewInventory(field: string, value: any) {
    this.newInventory.update(current => ({ ...current, [field]: value }));
}

  ngOnInit() { this.getInventory(); }

  getInventory() { this.inventoryService.getInventory().subscribe(inv => this.inventoryItems.set(inv)); }

  inventoryComplete() {
    const n = this.newInventory();
    return !!(n.vendor && n.material && n.want !== undefined && n.onhand !== undefined);
  }

  submitNewInventory() {
    this.inventoryService.addInventory(this.newInventory() as Inventory).subscribe(() => {
      this.addInventoryDialog.set(false);
      this.getInventory();
      this.messageService.add({severity:'success', summary:'Success', detail:'Item added'});
    });
  }
}