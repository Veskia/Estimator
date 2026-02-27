import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router'; // Add RouterModule
import { TableModule } from 'primeng/table'; // Add TableModule
import { ButtonModule } from 'primeng/button';

import { Order, Estimate } from '../models/estimate';
import { ReviewService } from '../services/review.service';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, RouterModule], // Include imports here
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private reviewService = inject(ReviewService);
    private loginService = inject(LoginService);

    // Ensure these Signals are defined
    groupId = signal<number | undefined>(undefined);
    displayId = signal<number | undefined>(undefined);
    order = signal<Order | undefined>(undefined);
    firstName = signal<string>('');
    lastName = signal<string>('');
    lastEstimateId = signal<number | undefined>(undefined);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const id = params['groupId'];
            if (id) {
                this.groupId.set(+id);
                this.displayId.set(+id + 100000);
                this.getOrder();
            }
        });
        this.getUserName();
    }

    getOrder(): void {
        const id = this.groupId();
        if (!id) return;
        this.reviewService.getOrder(id).subscribe(order => {
            this.order.set(order);
            if (order.estimates?.length) {
                this.lastEstimateId.set(order.estimates[order.estimates.length - 1].id);
            }
        });
    }

    getUserName(): void {
        this.loginService.getLogin().subscribe(login => {
            this.firstName.set(login.firstName);
            this.lastName.set(login.lastName);
        });
    }

    getPerSqFt(estimate: Estimate): number {
        const sqFt = (estimate.height * estimate.width) / 144;
        return estimate.wholesale / estimate.quantity / sqFt;
    }

    print() { window.print(); }
}