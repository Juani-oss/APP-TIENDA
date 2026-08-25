import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DashboardStats } from '../../../core/models/dashboard.model';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly stats = signal<DashboardStats | null>(null);
  readonly cargando = signal(true);

  ngOnInit(): void {
    this.dashboardService.obtenerStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
