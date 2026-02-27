import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { KeyFilterModule } from 'primeng/keyfilter';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';

import { CapacityService } from '../services/capacity.service';
import { LoginService } from '../services/login.service';
import { Printer } from '../models/printer';
import { Job } from '../models/job';

export interface Usage {
    id: number;
    printerId: number;
    printer: Printer;
    unitsUsed: number;
    editedUnitsUsed: number;
    useJobs: boolean;
    editing: boolean;
}

@Component({
  selector: 'app-capacity',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule,
    DialogModule, CalendarModule, DropdownModule, ConfirmDialogModule,
    ToastModule, KeyFilterModule, TooltipModule, CheckboxModule
  ],
  providers: [MessageService],
  templateUrl: './capacity.component.html',
  styleUrls: ['./capacity.component.css']
})
export class CapacityComponent implements OnInit {

    private capacityService = inject(CapacityService);
    private loginService = inject(LoginService);
    private confirmationService = inject(ConfirmationService) as ConfirmationService;
    private messageService = inject(MessageService) as MessageService;

    userLevel = signal<string | undefined>(undefined);
    loading = signal<boolean>(true);

    addingNewMachine = signal<boolean>(false);
    newMachine: Partial<Printer> = {};

    today = new Date();
    selectedDate = signal<Date>(new Date());
    jumpDate: Date | null = null;

    printers = signal<Printer[]>([]);
    usages = signal<Usage[]>([]);
    jobs = signal<Job[]>([]);
    jobCopies = signal<Job[]>([]);

    machineHoverMessage = signal<string>('');

    openMachineDecisionDialogue = signal<boolean>(false);
    editingMachine = signal<boolean>(false);
    selectedPrinter: Printer | null = null;
    printerCopy: Partial<Printer> = {};
    selectedUsage: Usage | null = null;

    enteringJobs = signal<boolean>(false);
    useJobsSelect = signal<boolean>(false);
    addingJob = signal<boolean>(false);
    newJob: Partial<Job> = {};

    openReportSelect = signal<boolean>(false);
    reportMode = signal<boolean>(false);
    reportPeriod = signal<string>('this week');
    customDateStart: Date | null = null;
    customDateEnd: Date | null = null;
    reportChoices: SelectItem[] = [];
    reports = signal<any>({});

    ngOnInit() {
        this.today.setHours(0, 0, 0, 0);
        this.selectedDate.set(new Date(this.today));

        this.loginService.getLogin().subscribe({
            next: (login) => {
                this.userLevel.set(login.level);
                if (login.level === 'guest') {
                    window.location.replace('http://signsinfo.com/login.php');
                }
                this.getPrinters();
            },
            error: (err) => console.error("Error getting login information.", err)
        });

        this.reportChoices = [
            {label: 'This Week', value: 'this week'}, {label: 'Past 7 Days', value: 'past 7 days'},
            {label: 'This Month', value: 'this month'}, {label: 'This Year', value: 'this year'},
            {label: 'Past 365 Days', value: 'past 365 days'}, {label: 'Custom', value: 'custom'}
        ];
    }

    getPrinters(): void {
        this.capacityService.getPrinters().subscribe({
            next: (printers) => {
                this.printers.set(printers);
                this.getPrinterUsages();
            },
            error: (err) => console.error("Error getting printers.", err)
        });
    }

    getPrinterUsages(): void {
        this.loading.set(true);
        this.capacityService.getPrinterUsages(this.selectedDate()).subscribe({
            next: (usages) => {
                const combinedUsages: Usage[] = [];
                this.printers().forEach(printer => {
                    const foundUsage = usages.find((u: any) => +u.printerId === printer.id);
                    if (foundUsage) {
                        foundUsage.printer = printer;
                        foundUsage.editedUnitsUsed = foundUsage.unitsUsed;
                        foundUsage.useJobs = foundUsage.useJobs === 1;
                        combinedUsages.push(foundUsage as Usage);
                    } else {
                        combinedUsages.push({
                            id: 0, printerId: printer.id, printer: printer,
                            unitsUsed: 0, editedUnitsUsed: 0, useJobs: false, editing: false
                        });
                    }
                });
                this.usages.set(combinedUsages);
                this.getJobs();
            },
            error: (err) => console.error("Error getting printer usages.", err)
        });
    }

    getJobs(): void {
        this.capacityService.getJobs(this.selectedDate()).subscribe({
            next: (jobs) => {
                this.jobs.set(jobs);
                this.updateUsageSqFt(false);
                this.loading.set(false);
            },
            error: (err) => console.error("Error getting jobs.", err)
        });
    }

    updateUsageSqFt(updateBackend: boolean): void {
        const jobsArr = this.jobs();
        this.usages.update(usagesArr => {
            return usagesArr.map(usage => {
                if (usage.useJobs) {
                    let total = 0;
                    jobsArr.filter(j => j.printerId === usage.printerId).forEach(job => {
                        total += (job.qty * job.height * job.length) / 144;
                    });
                    usage.unitsUsed = total;
                    if (updateBackend) this.updateBackendUsage(usage);
                }
                return usage;
            });
        });
    }

    updateBackendUsage(usage: Usage): void {
        this.capacityService.updateUsage(usage.id, this.selectedDate(), usage.unitsUsed).subscribe({
            next: (id) => {
                if (+id > 0) usage.id = +id;
            },
            error: (err) => console.error("Error updating usage automatically.", err)
        });
    }

    openMachineEditSelect(usage: Usage): void {
        if (this.userLevel() === 'admin' || this.userLevel() === 'superadmin') {
            this.selectedPrinter = usage.printer;
            this.selectedUsage = usage;
            this.openMachineDecisionDialogue.set(true);
        }
    }

    setMachineHoverMessage(printer: Printer): void {
        this.machineHoverMessage.set((this.userLevel() === 'admin' || this.userLevel() === 'superadmin') 
            ? `Click to edit ${printer.name}` : '');
    }

    startMachineEdit(): void {
        this.openMachineDecisionDialogue.set(false);
        this.editingMachine.set(true);
        this.printerCopy = structuredClone(this.selectedPrinter!);
    }

    startEnteringJobs(): void {
        this.openMachineDecisionDialogue.set(false);
        this.enteringJobs.set(true);
        this.useJobsSelect.set(this.selectedUsage!.useJobs);
        this.addingJob.set(false);
    }

    changeUseJobs(): void {
        const val = this.useJobsSelect();
        this.selectedUsage!.useJobs = val;
        this.capacityService.updateUseJobs(this.selectedUsage!.id, this.selectedDate(), val).subscribe({
            next: (id) => {
                if (+id > 0) this.selectedUsage!.id = +id;
                if (val) this.updateUsageSqFt(true);
            },
            error: (err) => console.error("Error changing use jobs bool.", err)
        });
    }

    startAddingJob(): void {
        this.addingJob.set(true);
        this.newJob = { qty: 1, printerId: this.selectedPrinter!.id };
    }

    submitNewJob(): void {
        this.capacityService.addJob(this.newJob).subscribe({
            next: (id) => {
                this.newJob.id = +id;
                this.jobs.update(arr => [...arr, this.newJob as Job]);
                this.updateUsageSqFt(true);
                this.addingJob.set(false);
                this.messageService.add({severity: 'success', summary: 'Success', detail: 'Job added.'});
            },
            error: (err) => console.error("Error adding job.", err)
        });
    }

    startEditingJob(job: Job): void {
        this.jobCopies.update(arr => [...arr, structuredClone(job)]);
    }

    cancelJobEdit(job: Job): void {
        this.jobCopies.update(arr => arr.filter(j => j.id !== job.id));
    }

    getJobCopy(job: Job): Job | undefined {
        return this.jobCopies().find(j => j.id === job.id);
    }

    submitEditedJob(job: Job): void {
        const copy = this.getJobCopy(job);
        if (!copy) return;

        this.capacityService.editJob(copy).subscribe({
            next: () => {
                job.name = copy.name; job.qty = copy.qty; job.height = copy.height; job.length = copy.length;
                this.updateUsageSqFt(true);
                this.cancelJobEdit(job);
                this.messageService.add({severity: 'success', summary: 'Success', detail: 'Job updated.'});
            },
            error: (err) => console.error("Error editing job.", err)
        });
    }

    deleteJob(job: Job): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${job.name}?`,
            header: 'Delete Confirmation',
            accept: () => {
                this.capacityService.deleteJob(job.id).subscribe({
                    next: () => {
                        this.jobs.update(arr => arr.filter(j => j.id !== job.id));
                        this.updateUsageSqFt(true);
                        this.messageService.add({severity: 'success', summary: 'Success', detail: 'Job deleted.'});
                    },
                    error: (err) => console.error("Error deleting job.", err)
                });
            }
        });
    }

    getJobsForSelectedPrinter(): Job[] {
        return this.selectedPrinter ? this.jobs().filter(j => j.printerId === this.selectedPrinter!.id) : [];
    }

    getJobSqFt(job: Partial<Job>): number | null {
        if (job.qty && job.height && job.length) return (job.qty * job.height * job.length) / 144;
        return null;
    }

    submitNewMachine(): void {
        this.capacityService.addMachine(this.newMachine as Printer).subscribe({
            next: (id) => {
                this.newMachine.id = +id;
                this.printers.update(arr => [...arr, this.newMachine as Printer]);
                this.usages.update(arr => [...arr, { id: 0, printerId: +id, printer: this.newMachine as Printer, unitsUsed: 0, editedUnitsUsed: 0, useJobs: false, editing: false }]);
                this.addingNewMachine.set(false);
                this.newMachine = {};
                this.messageService.add({severity: 'success', summary: 'Success', detail: 'Machine added.'});
            },
            error: (err) => console.error("Error adding machine.", err)
        });
    }

    submitMachineEdit(): void {
        this.capacityService.editMachine(this.printerCopy as Printer).subscribe({
            next: () => {
                this.selectedPrinter!.name = this.printerCopy.name!;
                this.selectedPrinter!.capacity = this.printerCopy.capacity!;
                this.selectedPrinter!.unit = this.printerCopy.unit!;
                this.editingMachine.set(false);
                this.messageService.add({severity: 'success', summary: 'Success', detail: 'Machine updated.'});
            },
            error: (err) => console.error("Error editing machine.", err)
        });
    }

    deleteMachine(): void {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${this.selectedPrinter!.name}?`,
            header: 'Delete Confirmation',
            accept: () => {
                this.capacityService.deleteMachine(this.selectedPrinter!.id).subscribe({
                    next: () => {
                        this.printers.update(arr => arr.filter(p => p.id !== this.selectedPrinter!.id));
                        this.usages.update(arr => arr.filter(u => u.printerId !== this.selectedPrinter!.id));
                        this.editingMachine.set(false);
                        this.messageService.add({severity: 'success', summary: 'Success', detail: 'Machine deleted.'});
                    },
                    error: (err) => console.error("Error deleting machine.", err)
                });
            }
        });
    }

    updateUnitsUsed(usage: Usage): void {
        this.capacityService.updateUsage(usage.id, this.selectedDate(), usage.editedUnitsUsed).subscribe({
            next: (id) => {
                if (+id > 0) usage.id = +id;
                usage.unitsUsed = usage.editedUnitsUsed;
                usage.editing = false;
            },
            error: (err) => console.error("Error updating usage.", err)
        });
    }

    cancelUnitsUpdate(usage: Usage): void {
        usage.editedUnitsUsed = usage.unitsUsed;
        usage.editing = false;
    }

    changeDateOffset(days: number): void {
        const d = new Date(this.selectedDate());
        d.setDate(d.getDate() + days);
        this.selectedDate.set(d);
        this.getPrinterUsages();
        this.jumpDate = null;
    }

    jumpToDate(): void {
        if (this.jumpDate) {
            this.selectedDate.set(this.jumpDate);
            this.getPrinterUsages();
        }
    }

    getPercentage(usage: Usage): number {
        return usage.unitsUsed / usage.printer.capacity;
    }

    getTotalSqFt(): number {
        return this.usages().filter(u => u.printer.unit === 'Sq. ft.').reduce((acc, u) => acc + +u.unitsUsed, 0);
    }

    getTotalPercentage(): number {
        let capacity = 0;
        let used = 0;
        this.usages().filter(u => u.printer.unit === 'Sq. ft.').forEach(u => {
            capacity += +u.printer.capacity;
            used += +u.unitsUsed;
        });
        return capacity ? used / capacity : 0;
    }

    getEditingMode(): boolean {
        return this.usages().some(u => u.editing);
    }

    startReport(): void {
        this.openReportSelect.set(false);
        this.reportMode.set(true);
        this.loading.set(true);
        
        let startDate = new Date();
        let endDate = new Date();
        const period = this.reportPeriod();

        if (period === "this week") {
            startDate.setDate(startDate.getDate() - startDate.getDay());
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 4);
        } else if (period === "past 7 days") {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === "this month") {
            startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        } else if (period === "this year") {
            startDate = new Date(startDate.getFullYear(), 0, 1);
        } else if (period === "past 365 days") {
            startDate.setDate(startDate.getDate() - 365);
        } else if (period === "custom" && this.customDateStart && this.customDateEnd) {
            startDate = new Date(this.customDateStart);
            endDate = new Date(this.customDateEnd);
        }

        this.capacityService.getReport(startDate, endDate).subscribe({
            next: (response) => {
                this.reports.set(response);
                this.loading.set(false);
            },
            error: (err) => console.error("Error getting report.", err)
        });
    }

    getTotalReportPercentage(): number {
        const reportData = this.reports();
        let total = 0;
        const count = this.printers().length;
        if (count === 0) return 0;

        for (const key in reportData) {
            total += reportData[key];
        }
        return total / count;
    }
}