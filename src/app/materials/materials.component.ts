import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG UI Imports (These belong in the 'imports' array)
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { KeyFilterModule } from 'primeng/keyfilter';
import { TooltipModule } from 'primeng/tooltip';

// Logic Imports (These do NOT belong in the 'imports' array)
import { ConfirmationService, MessageService } from 'primeng/api';
import { MaterialsService } from '../services/materials.service';
import { LoginService } from '../services/login.service';
import { Material } from '../models/material';

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TableModule, 
    ButtonModule, 
    InputTextModule,
    DropdownModule, 
    CheckboxModule, 
    DialogModule, 
    ConfirmDialogModule, 
    ToastModule, 
    KeyFilterModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.css']
})
export class MaterialsComponent implements OnInit {
    private materialsService = inject(MaterialsService);
    private loginService = inject(LoginService);
    private confirmationService = inject(ConfirmationService) as ConfirmationService;
    private messageService = inject(MessageService) as MessageService;

    // Signals for state management
    userLevel = signal<string | undefined>(undefined);
    newMaterial = signal<Partial<Material>>({});
    materials = signal<Material[]>([]);
    filteredMaterials = signal<Material[]>([]);
    loading = signal<boolean>(false);
    addMaterialDialog = signal<boolean>(false);
    
    materialTypes: any[] = [
        {label: 'PSV', value: 'psv'},
        {label: 'DyeSub', value: 'dyesub'},
        {label: 'Banner', value: 'banner'}
    ];

    ngOnInit() {
        this.loginService.getLogin().subscribe((login: any) => {
            this.userLevel.set(login.level);
            this.getMaterials();
        });
    }

    // ==========================================
    // HELPER METHODS (Required by the HTML)
    // ==========================================

    /**
     * Updates the newMaterial Signal object correctly.
     */
    updateNewMaterial(field: string, value: any) {
        this.newMaterial.update(m => ({ ...m, [field]: value }));
    }

    /**
     * Returns "Yes" or "No" for the lamination status.
     */
    fullLaminationWord(val: any): string {
        if (val === 1 || val === true || val === 'Y') return 'Yes';
        if (val === 'A') return 'Auto';
        return 'No';
    }

    /**
     * Capitalizes the first letter of material types.
     */
    materialTypeDisplay(val: string): string {
        if (!val) return '';
        const types: Record<string, string> = { 'psv': 'PSV', 'dyesub': 'DyeSub' };
        return types[val] || val.charAt(0).toUpperCase() + val.slice(1);
    }

    /**
     * Checks if the required fields are filled.
     */
    materialComplete(m: any): boolean {
        return !!(m.name && m.multiplier);
    }

    /**
     * Helps the table render faster.
     */
    rowTrackBy(index: number, item: any) {
        return item.id;
    }

    // ==========================================
    // ACTION METHODS
    // ==========================================

    getMaterials() {
        this.loading.set(true);
        this.materialsService.getMaterials().subscribe((mats: Material[]) => {
            this.materials.set(mats);
            this.filteredMaterials.set(mats);
            this.loading.set(false);
        });
    }

    submitNewMaterial(materialData: any) {
        this.materialsService.addMaterial(materialData).subscribe({
            next: () => {
                this.addMaterialDialog.set(false);
                this.getMaterials();
                this.messageService.add({severity: 'success', summary: 'Success', detail: 'Material added.'});
                this.newMaterial.set({}); 
            }
        });
    }

    editCell(material: Material, field: string, value: any) {
        // Explicitly cast input values to numbers if the field is a price/qty
        const finalValue = (typeof value === 'string' && !isNaN(Number(value))) ? Number(value) : value;
        this.materialsService.editMaterial(material.id, field, finalValue).subscribe();
    }

    delete(material: Material) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${material.name}?`,
            accept: () => {
                this.materialsService.deleteMaterial(material.id).subscribe(() => {
                    this.getMaterials();
                    this.messageService.add({severity: 'success', summary: 'Success', detail: 'Material deleted.'});
                });
            }
        });
    }
}