import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private messageId = 0;

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 3000): void {
    const toast: ToastMessage = {
      id: this.messageId++,
      message,
      type,
      duration
    };

    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration || 5000);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  remove(id: number): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next(currentMessages.filter(msg => msg.id !== id));
  }

  clear(): void {
    this.messagesSubject.next([]);
  }
}
