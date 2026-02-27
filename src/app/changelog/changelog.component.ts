import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { SelectItem } from 'primeng/api';

import { Change } from '../models/change';
import { ChangelogService } from '../services/changelog.service';

@Component({
  selector: 'app-changelog',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, MultiSelectModule, InputTextModule],
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.css']
})
export class ChangelogComponent implements OnInit {

    private changelogService = inject(ChangelogService);

    // Signals for state
    changes = signal<Change[]>([]);
    locations = signal<SelectItem[]>([]);
    companies = signal<SelectItem[]>([]);
    operations = signal<SelectItem[]>([]);
    columns = signal<SelectItem[]>([]);

    ngOnInit() {
        this.getChanges();
        
        this.locations.set([
            {label: 'Materials', value: 'Materials'},
            {label: 'Finishing', value: 'Finishing'},
            {label: 'Sales Multiplier', value: 'Sales Multiplier'},
            {label: 'Users', value: 'Users'}
        ]);
        
        this.companies.set([
            {label: 'GH', value: 'gh'},
            {label: 'BigSigns', value: 'bigsigns'},
            {label: 'Brunswick', value: 'brunswick'}
        ]);
        
        this.operations.set([
            {label: 'Insert', value: 'insert'},
            {label: 'Edit', value: 'edit'},
            {label: 'Delete', value: 'delete'}
        ]);
        
        this.columns.set([
            {label: 'Name', value: 'name'}, {label: 'Multiplier', value: 'multiplier'},
            {label: '32', value: 'c32'}, {label: '100', value: 'c100'},
            {label: '500', value: 'c500'}, {label: '1000', value: 'c1000'},
            {label: '2500', value: 'c2500'}, {label: '5000', value: 'c5000'},
            {label: '10000', value: 'c10000'}, {label: 'Scrap', value: 'scrap'},
            {label: 'Width', value: 'width'}, {label: 'Width 2', value: 'width2'},
            {label: 'Width 3', value: 'width3'}, {label: 'Width 4', value: 'width4'},
            {label: 'Margin', value: 'margin'}, {label: 'Starting SqFt', value: 'startingSqFt'},
            {label: 'Diecut', value: 'diecut'}, {label: 'Laminate', value: 'laminate'},
            {label: 'Type', value: 'materialType'}, {label: 'Weight', value: 'weight'},
            {label: 'Active', value: 'active'}, {label: '8', value: 'c8'},
            {label: '20', value: 'c20'}, {label: '21', value: 'c21'},
            {label: 'Min', value: 'min'}, {label: 'Max', value: 'max'},
            {label: 'Default', value: 'default'}, {label: 'Level', value: 'level'},
            {label: 'Email', value: 'email'}, {label: 'First Name', value: 'firstName'},
            {label: 'Last Name', value: 'lastName'}
        ]);
    }

    getChanges(): void {
        this.changelogService.getChanges().subscribe({
            next: (changes) => this.changes.set(changes),
            error: (err) => console.error("Error getting changelog.", err)
        });
    }

    displayCompany(companyCode: string): string {
        if (companyCode === 'gh') return "GH";
        if (companyCode === 'bigsigns') return "BigSigns";
        if (companyCode === 'brunswick') return "Brunswick";
        return companyCode;
    }

    displayColName(colName: string): string {
        const found = this.columns().find(col => col.value === colName);
        return found ? found.label! : colName;
    }

    displaySingleValue(change: Change, val: string): string {
        if (val) {
            const object = JSON.parse(val);
            if (object && object[change.colName] !== undefined) {
                if (change.colName === 'c8' || change.colName === 'c20' || change.colName === 'c21' ||
                    change.colName === 'c32' || change.colName === 'c100' || change.colName === 'c500' ||
                    change.colName === 'c1000' || change.colName === 'c2500' || change.colName === 'c5000' ||
                    change.colName === 'c10000') {
                    return "$" + parseFloat(object[change.colName]).toFixed(2);
                } else if (['width', 'width2', 'width3', 'width4'].includes(change.colName)) {
                    return object[change.colName] + " in.";
                } else if (change.colName === 'weight') {
                    return object[change.colName] + " lbs";
                } else if (change.colName === 'level') {
                    const levelMap: Record<string, string> = {
                        'salesgh': "Sales GH", 'bigsigns': "BigSigns",
                        'manager': "Project Manager", 'superadmin': "Super Admin",
                        'brunsadmin': "Brunswick Admin", 'brunsuser': "Brunswick User"
                    };
                    return levelMap[object[change.colName]] || this.capitalize(object[change.colName]);
                }
                return object[change.colName];
            }
        }
        return '';
    }

    capitalize(word: string): string {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
}