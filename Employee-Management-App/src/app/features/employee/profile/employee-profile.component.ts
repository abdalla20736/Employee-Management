import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { ToastService } from '../../../core/services/toast.service';
import { SignatureComponent } from '../../../shared/components/signature/signature.component';
import { User } from '../../../core/models/user.model';
import { getSignatureImageUrl } from '../../../core/constants/api.constants';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, SignatureComponent],
  templateUrl: './employee-profile.component.html',
  styleUrl: './employee-profile.component.css',
})
export class EmployeeProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private toastService = inject(ToastService);

  user: User | null = null;
  isLoading = false;
  signature = '';
  signatureFile: File | null = null;
  isSavingSignature = false;

  get signatureImageUrl(): string {
    return getSignatureImageUrl(this.user?.electronicSignature);
  }

  get signatureImageUrlForCanvas(): string {
    return getSignatureImageUrl(this.signature);
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    const user = this.authService.getCurrentUser();
    if (user) {
      this.user = user;
      this.signature = user.electronicSignature || '';
      this.isLoading = false;
    } else {
      this.toastService.error('User data not found');
      this.isLoading = false;
    }
  }

  onSignatureChange(signature: string): void {
    this.signature = signature;
  }

  onSignatureFileChange(file: File | null): void {
    this.signatureFile = file;
  }

  onSignatureExportError(message: string): void {
    this.toastService.error(message);
  }

  saveSignature(): void {
    if (!this.signatureFile) {
      this.toastService.warning('Please add a signature first (draw or upload an image)');
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user?.nationalId) {
      this.toastService.error('User not found');
      return;
    }

    this.isSavingSignature = true;

    this.employeeService.uploadSignature(user.nationalId, this.signatureFile).subscribe({
      next: (response) => {
        const updatedUser: User = {
          ...user,
          electronicSignature: this.signature,
        };
        this.authService.updateCurrentUser(updatedUser);

        this.toastService.success('Signature saved successfully');
        this.isSavingSignature = false;
        this.loadProfile();
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to save signature');
        this.isSavingSignature = false;
      },
    });
  }
}
