import { Observable } from 'rxjs'; // Modern RxJS import
import { ToolbarService } from '../services/toolbar.service';

export abstract class Reference {
    id!: number;
    caption!: string;
    captionCopy!: string;    // copy of caption in case user cancels editing
    editing: boolean;
    displayOrder!: number;

    constructor(protected toolbarService: ToolbarService) {
        this.editing = false;
    }

    abstract addReference(): Observable<string>;
    abstract editReference(): Observable<string>;
    abstract isTable(): boolean;
    abstract cancelEditing(): void;
    abstract updateCopies(): void;
}

export class TextReference extends Reference {
    data!: string;
    dataCopy!: string;   // copy of data in case user cancels editing

    addReference(): Observable<string> {
        return this.toolbarService.addTextReference(this.caption, this.data);
    }

    editReference(): Observable<string> {
        return this.toolbarService.editTextReference(this.id, this.caption, this.data);
    }

    isTable (): boolean {
        return false;
    }

    cancelEditing(): void {
        this.caption = this.captionCopy;
        this.data = this.dataCopy;
        this.editing = false;
    }

    updateCopies(): void {
        this.captionCopy = this.caption;
        this.dataCopy = this.data;
    }
}

export class TableReference extends Reference {
    cols: any[];
    rows: any[];
    colsCopy!: any[];
    rowsCopy!: any[];

    constructor(protected toolbarService: ToolbarService) {
        super(toolbarService);
        this.cols = [
            { field: 0, header: ''},
            { field: 1, header: ''},
            { field: 2, header: ''}
        ];
        this.rows = [
            {0: '', 1: '', 2: ''},
            {0: '', 1: '', 2: ''},
            {0: '', 1: '', 2: ''}
        ];
    }

    addCol(): void {
        const colCount = this.cols.length;
        this.cols.push({ field: colCount, header: ''});
        // Native JavaScript instead of lodash
        this.rows.forEach(row => row[colCount] = '');
    }

    removeCol(): void {
        if (this.cols.length > 1) {
            this.cols.splice(-1, 1);
        }
    }

    addRow(): void {
        const row: any = {0: ''};
        for (let i = 1; i < this.cols.length; i++) {
            row[i] = '';
        }
        this.rows.push(row);
    }

    removeRow(): void {
        if (this.rows.length > 1) {
            this.rows.splice(-1, 1);
        }
    }

    addReference(): Observable<string> {
        // Native JavaScript map instead of lodash
        const tableHeaders = this.cols.map(col => col.header);
        return this.toolbarService.addTableReference(this.caption, tableHeaders, this.rows);
    }

    editReference(): Observable<string> {
        const tableHeaders = this.cols.map(col => col.header);
        return this.toolbarService.editTableReference(this.id, this.caption, tableHeaders, this.rows);
    }

    isTable(): boolean {
        return true;
    }

    cancelEditing(): void {
        this.caption = this.captionCopy;
        // Modern native deep cloning instead of _.cloneDeep
        this.rows = structuredClone(this.rowsCopy);
        this.cols = structuredClone(this.colsCopy);
        this.editing = false;
    }

    updateCopies(): void {
        this.captionCopy = this.caption;
        this.rowsCopy = structuredClone(this.rows);
        this.colsCopy = structuredClone(this.cols);
    }
}