import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  toastService = inject(ToastService);
  messages$ = this.toastService.messages$;

  removeToast(id: number): void {
    this.toastService.remove(id);
  }

  getToastClass(type: string): string {
    const classes: { [key: string]: string } = {
      success: 'bg-success text-white',
      error: 'bg-danger text-white',
      info: 'bg-info text-white',
      warning: 'bg-warning text-dark',
    };
    return classes[type] || classes['info'];
  }
}
