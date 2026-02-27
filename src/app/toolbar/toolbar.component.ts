import { Component, EventEmitter, OnInit, Output, inject, input, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

// Services & Models
import { ToolbarService } from '../services/toolbar.service';
import { Material } from '../models/material';
import { Preset } from '../models/preset';
import { Reference, TableReference, TextReference } from '../models/reference';

export interface Thickness {
    bondLedger: number; offsetText: number; cover: number; tag: number;
    index: number; points: number; caliper: number; metric: number; gsm: number;
}
export interface Rigid { name: string; ss: number; ds: number; }

@Component({
    selector: 'app-toolbar',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, TableModule, DialogModule, 
        InputTextModule, InputTextareaModule, RadioButtonModule, ToastModule, ConfirmDialogModule
    ],
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

    // Modern Signal Inputs (Replaces @Input)
    toolbarSelection = input<string | undefined>();
    material = input<Material | undefined>();
    quantity = input<number | undefined>();
    height = input<number | undefined>();
    width = input<number | undefined>();
    userView = input<string | undefined>();
    jumpToReferenceId = input<number | undefined>();

    @Output() choosePreset = new EventEmitter<Preset>();

    private toolbarService = inject(ToolbarService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);

    thicknessArr: Thickness[] = [];
    rigidArr: Rigid[] = [];

    // --- AUTOMATIC COMPUTED MATH SIGNALS ---
    // These instantly recalculate whenever height, width, or quantity change!

    sqFt = computed(() => {
        const h = this.height(); const w = this.width();
        return (h && w) ? (h * w) / 144 : null;
    });

    totalSqFt = computed(() => {
        const s = this.sqFt(); const q = this.quantity();
        return (s && q) ? s * q : null;
    });

    weight = computed(() => {
        const t = this.totalSqFt(); const m = this.material();
        return (t && m?.weight) ? t * m.weight : null;
    });

    // Wind Load Calculations
    loadNum = computed(() => {
        const s = this.sqFt();
        return s ? s * 15 : null;
    });
    
    grommets = signal<number | null>(null);
    fixtures = signal<number | null>(null);
    pocketIn = signal<number | null>(null);

    grommetLoad = computed(() => (this.loadNum() && this.grommets()) ? this.loadNum()! / this.grommets()! : null);
    fixtureLoad = computed(() => (this.loadNum() && this.fixtures()) ? this.loadNum()! / this.fixtures()! : null);
    lbsLoad = computed(() => (this.loadNum() && this.pocketIn()) ? this.loadNum()! / this.pocketIn()! : null);

    // In-Between Calculations
    qtyA = signal<number | null>(null);
    qtyB = signal<number | null>(null);
    priceA = signal<number | null>(null);
    priceB = signal<number | null>(null);
    qtyNeeded = signal<number | null>(null);

    betweenPrice = computed(() => {
        const qa = this.qtyA(); const qb = this.qtyB();
        const pa = this.priceA(); const pb = this.priceB();
        const qn = this.qtyNeeded();
        if (qa && qb && pa && pb && qn) {
            const box1 = (pb - pa) / (qb - qa);
            return +pa + (box1 * (qn - qa));
        }
        return null;
    });

    // Fabric Fence Calculations
    fabricLength = signal<number | null>(null);
    fabricData = computed(() => {
        const len = this.fabricLength();
        if (len) {
            let linerFt = 6;
            if (len >= 900) linerFt = 4.19;
            else if (len >= 600) linerFt = 4.78;
            else if (len >= 300) linerFt = 5.17;
            return { linerFt, totalPrice: len * linerFt };
        }
        return { linerFt: null, totalPrice: null };
    });

    // Powergrip Calculations
    powergripData = computed(() => {
        const q = this.quantity(); const h = this.height(); const w = this.width();
        if (q && h && w) {
            const aluminumSticks = Math.ceil(((+h + +w) * 2) / 137);
            const eachCost = (aluminumSticks * 65) + 50;
            return { aluminumSticks, clippingBars: aluminumSticks * 11, eachCost, totalCost: eachCost * q };
        }
        return { aluminumSticks: null, clippingBars: null, eachCost: null, totalCost: null };
    });

    // DuraFlex Calculations
    flexHeight = signal<number | null>(null);
    flexWidth = signal<number | null>(null);
    duraFlexData = computed(() => {
        const h = this.flexHeight(); const w = this.flexWidth();
        if (h && w) {
            const t = +h + +w;
            const totalFt = (t * 2) / 12;
            const toolPriceEach = (10.97 * totalFt) + 105;
            const noToolPriceEach = toolPriceEach - 55;
            return {
                t, totalFt, flexClips: totalFt * 2,
                toolPriceEach, toolCostPerFt: toolPriceEach / totalFt,
                noToolPriceEach, noToolCostPerFt: noToolPriceEach / totalFt
            };
        }
        return { t: null, totalFt: null, flexClips: null, toolPriceEach: null, toolCostPerFt: null, noToolPriceEach: null, noToolCostPerFt: null };
    });

    // References
    addNewReference = false;
    newTableReference!: TableReference;
    newTextReference!: TextReference;
    newReferenceType = 'table';
    newReferenceCaption = '';
    changeReferenceOrder = false;

    references = signal<Reference[]>([]);
    referencesCopy: Reference[] = [];

    // VCL Properties
    rowsArr = [0, 1, 2, 3, 4, 5, 6];
    charNumArr: (number | null)[] = Array(7).fill(null);
    letterHeightArr: (number | null)[] = Array(7).fill(null);
    charCostArr: (number | null)[] = Array(7).fill(null);
    totalArr: (number | null)[] = Array(7).fill(null);
    vclTotal: number | null = null;

    presets = signal<Preset[]>([]);

    constructor() {
        // Automatically jump to reference if ID is provided
        effect(() => {
            const jumpId = this.jumpToReferenceId();
            if (jumpId) {
                setTimeout(() => this.jumpToReference(jumpId), 100);
            }
        });
    }

    ngOnInit() {
        this.thicknessArr = [
            {bondLedger: 16, offsetText: 40, cover: 22, tag: 37, index: 33, points: 3.2, caliper: 0, metric: 0.08, gsm: 60.2},
            {bondLedger: 18, offsetText: 45, cover: 24, tag: 41, index: 37, points: 3.6, caliper: 0, metric: 0.09, gsm: 67.72 },
            {bondLedger: 20, offsetText: 50, cover: 28, tag: 46, index: 42, points: 3.8, caliper: 0, metric: 0.1, gsm: 75.2 },
            {bondLedger: 24, offsetText: 60, cover: 33, tag: 56, index: 50, points: 4.8, caliper: 0, metric: 0.12, gsm: 90.3 },
            {bondLedger: 28, offsetText: 70, cover: 39, tag: 64, index: 58, points: 5.8, caliper: 0.01, metric: 0.15, gsm: 105.35 },
            {bondLedger: 29, offsetText: 73, cover: 40, tag: 62, index: 60, points: 6, caliper: 0.01, metric: 0.15, gsm: 109.11 },
            {bondLedger: 31, offsetText: 81, cover: 45, tag: 73, index: 66, points: 6.1, caliper: 0.01, metric: 0.16, gsm: 116.63 },
            {bondLedger: 35, offsetText: 90, cover: 48, tag: 80, index: 74, points: 6.2, caliper: 0.01, metric: 0.16, gsm: 131.68 },
            {bondLedger: 36, offsetText: 90, cover: 50, tag: 82, index: 75, points: 6.8, caliper: 0.01, metric: 0.17, gsm: 135.45 },
            {bondLedger: 39, offsetText: 100, cover: 54, tag: 90, index: 81, points: 7.2, caliper: 0.01, metric: 0.18, gsm: 146.73 },
            {bondLedger: 40, offsetText: 100, cover: 56, tag: 93, index: 83, points: 7.3, caliper: 0.01, metric: 0.19, gsm: 150.5 },
            {bondLedger: 43, offsetText: 110, cover: 60, tag: 100, index: 90, points: 7.4, caliper: 0.01, metric: 0.19, gsm: 161.78 },
            {bondLedger: 44, offsetText: 110, cover: 61, tag: 102, index: 92, points: 7.6, caliper: 0.01, metric: 0.19, gsm: 165.55 },
            {bondLedger: 47, offsetText: 120, cover: 65, tag: 108, index: 97, points: 8, caliper: 0.01, metric: 0.2, gsm: 176.83 },
            {bondLedger: 53, offsetText: 135, cover: 74, tag: 122, index: 110, points: 9, caliper: 0.01, metric: 0.22, gsm: 199.41 },
            {bondLedger: 54, offsetText: 137, cover: 75, tag: 125, index: 113, points: 9, caliper: 0.01, metric: 0.23, gsm: 203.17 },
            {bondLedger: 58, offsetText: 146, cover: 80, tag: 134, index: 120, points: 9.5, caliper: 0.01, metric: 0.23, gsm: 218.22 },
            {bondLedger: 65, offsetText: 165, cover: 90, tag: 150, index: 135, points: 10, caliper: 0.01, metric: 0.24, gsm: 244.56 },
            {bondLedger: 67, offsetText: 170, cover: 93, tag: 156, index: 140, points: 10.5, caliper: 0.01, metric: 0.25, gsm: 252.08 },
            {bondLedger: 72, offsetText: 183, cover: 100, tag: 166, index: 150, points: 11, caliper: 0.01, metric: 0.29, gsm: 270.9 },
            {bondLedger: 76, offsetText: 192, cover: 105, tag: 175, index: 158, points: 13, caliper: 0.01, metric: 0.33, gsm: 285.95 },
            {bondLedger: 82, offsetText: 208, cover: 114, tag: 189, index: 170, points: 14, caliper: 0.01, metric: 0.36, gsm: 308.52 },
            {bondLedger: 87, offsetText: 220, cover: 120, tag: 200, index: 180, points: 15, caliper: 0.02, metric: 0.38, gsm: 312 },
            {bondLedger: 105, offsetText: 267, cover: 146, tag: 244, index: 220, points: 18, caliper: 0.02, metric: 0.45, gsm: 385.06 }
        ];

        this.rigidArr = [
            {'name': 'ACM 3mm', 'ss': 188, 'ds': 296},
            {'name': 'Alumalite 6mm', 'ss': 192, 'ds': 292},
            {'name': 'Aluminum .063', 'ss': 205, 'ds': 319},
            {'name': 'ConVerd Paper board 3mm', 'ss': 90, 'ds': 168},
            {'name': 'Coroplast 4mm', 'ss': 80, 'ds': 152},
            {'name': 'Gator 1/2"', 'ss': 160, 'ds': 244},
            {'name': 'Gator 3/16"', 'ss': 115, 'ds': 184},
            {'name': 'Sintra 13mm', 'ss': 220, 'ds': 328},
            {'name': 'Sintra 3mm', 'ss': 115, 'ds': 203},
            {'name': 'Sintra 6mm', 'ss': 149, 'ds': 252},
            {'name': 'Stryene .020', 'ss': 80, 'ds': 152}
        ];

        this.newTableReference = new TableReference(this.toolbarService);
        this.newTextReference = new TextReference(this.toolbarService);

        this.getPresets();
        this.getReferences();
    }

    getReferences() {
        this.toolbarService.getReferences().subscribe({
            next: (references) => {
                const refs = references.map((reference: any) => {
                    let newRef: Reference;
                    if (reference.isTable) {
                        const tableRef = new TableReference(this.toolbarService);
                        tableRef.cols = JSON.parse(reference.headers).map((header: string, i: number) => ({ field: i, header }));
                        tableRef.rows = JSON.parse(reference.data);
                        tableRef.colsCopy = structuredClone(tableRef.cols);
                        tableRef.rowsCopy = structuredClone(tableRef.rows);
                        newRef = tableRef;
                    } else {
                        const textRef = new TextReference(this.toolbarService);
                        textRef.data = reference.data;
                        textRef.dataCopy = reference.data;
                        newRef = textRef;
                    }
                    newRef.id = reference.id;
                    newRef.caption = reference.caption;
                    newRef.captionCopy = reference.caption;
                    newRef.displayOrder = reference.displayOrder;
                    return newRef;
                });
                this.references.set(refs);
                this.referencesCopy = structuredClone(refs);
            },
            error: (err) => console.error("Error getting references.", err)
        });
    }

    hasHeaderContent(cols: any[]) {
        return cols.some(col => col.header !== "");
    }

    initializeNewReferences() {
        this.newReferenceCaption = "";
        this.newTableReference = new TableReference(this.toolbarService);
        this.newTextReference = new TextReference(this.toolbarService);
        this.addNewReference = true;
    }

    displayHtml(html: string) { return html.replace(new RegExp('\n', 'g'), "<br />"); }

    initializeReferenceReorder() {
        this.referencesCopy = structuredClone(this.references());
        this.changeReferenceOrder = true;
    }

    saveReferenceOrder() {
        const refs = structuredClone(this.referencesCopy);
        refs.forEach((ref, index) => ref.displayOrder = index);
        this.references.set(refs);

        this.toolbarService.updateDisplayOrder(refs).subscribe({
            next: (response) => {
                if (response === 'success') {
                    this.messageService.add({severity: 'success', summary: 'Success', detail: 'Reference order updated.'});
                    this.changeReferenceOrder = false;
                } else {
                    this.messageService.add({severity: 'error', summary: 'Error', detail: "Error updating reference order."});
                }
            },
            error: (err) => console.error(err)
        });
    }

    jumpToReference(referenceId: number) {
        const element = document.getElementById("reference" + referenceId);
        if (element) { element.scrollIntoView(); }
    }

    submitNewReference() {
        const newReference = this.newReferenceType === 'table' ? this.newTableReference : this.newTextReference;
        newReference.caption = this.newReferenceCaption;

        newReference.addReference().subscribe({
            next: (response) => {
                if (response === 'caption error') {
                    this.messageService.add({severity: 'error', summary: 'Error', detail: "Caption exists. Please change."});
                } else {
                    this.messageService.add({severity: 'success', summary: 'Success', detail: 'Reference added.'});
                    newReference.id = parseInt(response, 10);
                    newReference.updateCopies();
                    this.references.update(arr => [...arr, newReference]);
                    this.addNewReference = false;
                }
            },
            error: (err) => console.error(err)
        });
    }

    submitReferenceEdit(reference: Reference): void {
        reference.editReference().subscribe({
            next: () => {
                this.messageService.add({severity: 'success', summary: 'Success', detail: reference.caption + " updated."});
                reference.updateCopies();
                reference.editing = false;
            },
            error: (err) => console.error(err)
        });
    }

    deleteReference(reference: Reference): void {
        this.confirmationService.confirm({
            message: "Delete " + reference.caption + "?",
            header: "Delete Reference",
            accept: () => {
                this.toolbarService.deleteReference(reference.id).subscribe({
                    next: () => {
                        this.references.update(arr => arr.filter(r => r.id !== reference.id));
                        this.messageService.add({severity: 'success', summary: 'Success', detail: reference.caption + " deleted."});
                    },
                    error: (err) => console.error(err)
                });
            }
        });
    }

    calculateVCLRow(rowNum: number): void {
        if (this.charNumArr[rowNum] && this.letterHeightArr[rowNum]) {
            this.charCostArr[rowNum] = this.letterHeightArr[rowNum]! * 0.3;
            this.totalArr[rowNum] = this.charCostArr[rowNum]! * this.charNumArr[rowNum]!;
        } else {
            this.charCostArr[rowNum] = this.totalArr[rowNum] = null;
        }
        this.calculateVCL();
    }

    calculateVCL(): void {
        let empty = true;
        let total = 15;
        this.totalArr.forEach(t => {
            if (t) { empty = false; total += t; }
        });
        this.vclTotal = empty ? null : total;
    }

    getPresets(): void {
        this.toolbarService.getPresets().subscribe({
            next: (presets) => this.presets.set(presets),
            error: (err) => console.error(err)
        });
    }

    selectPreset(preset: Preset): void { this.choosePreset.emit(preset); }

    deletePreset(event: Event, preset: Preset): void {
        event.stopPropagation();
        this.confirmationService.confirm({
            message: "Delete " + preset.name + "?",
            header: "Delete Confirmation",
            accept: () => {
                this.toolbarService.deletePreset(preset.id).subscribe({
                    next: () => {
                        this.presets.update(p => p.filter(old => old.id !== preset.id));
                        this.messageService.add({severity: 'success', summary: 'Success', detail: preset.name + ' deleted.'});
                    },
                    error: (err) => console.error(err)
                });
            }
        });
    }

    rounded(value: number | null, precision: number): number | null {
        if (!value) return 0;
        const factor = Math.pow(10, precision);
        return Math.round(value * factor) / factor || null;
    }
}