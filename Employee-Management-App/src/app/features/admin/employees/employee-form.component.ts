import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { ToastService } from '../../../core/services/toast.service';
import { SignatureComponent } from '../../../shared/components/signature/signature.component';
import {
  Employee,
  EmployeeCreateRequest,
  EmployeeUpdateRequest,
} from '../../../core/models/employee.model';
import { getSignatureImageUrl } from '../../../core/constants/api.constants';
import { finalize, of } from 'rxjs';
import { switchMap, catchError, delay } from 'rxjs/operators';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SignatureComponent],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css',
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  employeeForm: FormGroup;
  isEditMode = false;
  employeeId: string | null = null;
  isLoading = false;
  loadingEmployee = false;
  uploadingSignature = false;
  signature = '';
  signatureFile: File | null = null;
  savedSignature = '';

  get savedSignatureImageUrl(): string {
    return getSignatureImageUrl(this.savedSignature);
  }

  get signatureImageUrl(): string {
    return getSignatureImageUrl(this.signature);
  }

  constructor() {
    this.employeeForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(2)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      nationalID: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]+$/),
          Validators.minLength(14),
          Validators.maxLength(14),
        ],
      ],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      password: [''],
    });
  }

  private static readonly PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.employeeId = id;
      this.loadEmployee(id);
    } else {
      this.employeeForm
        .get('password')
        ?.setValidators([
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(EmployeeFormComponent.PASSWORD_PATTERN),
        ]);
    }
  }

  loadEmployee(id: string): void {
    this.loadingEmployee = true;
    this.cdr.markForCheck();
    this.employeeService
      .getEmployeeById(id)
      .pipe(
        finalize(() => {
          this.loadingEmployee = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          const employee = (response as { data?: unknown }).data ?? response;
          const e = employee as {
            userName?: string;
            firstName?: string;
            lastName?: string;
            phoneNumber?: string;
            nationalID?: string;
            nationalId?: string;
            age?: number;
            electronicSignature?: string;
          };
          this.employeeForm.patchValue({
            userName: e.userName ?? '',
            firstName: e.firstName ?? '',
            lastName: e.lastName ?? '',
            phoneNumber: e.phoneNumber ?? '',
            nationalID: e.nationalID ?? e.nationalId ?? '',
            age: e.age ?? '',
            password: '',
          });
          this.signature = e.electronicSignature ?? '';
          this.savedSignature = e.electronicSignature ?? '';
        },
        error: () => {
          this.toastService.error('Failed to load employee');
        },
      });
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      this.isLoading = true;
      const raw = this.employeeForm.value;
      const formData: EmployeeCreateRequest = {
        userName: raw.userName,
        firstName: raw.firstName,
        lastName: raw.lastName,
        phoneNumber: raw.phoneNumber,
        nationalID: raw.nationalID,
        age: raw.age,
        electronicSignature: this.signature || undefined,
        password: raw.password || '',
      };

      if (this.isEditMode && this.employeeId) {
        const updateData: EmployeeUpdateRequest = {
          firstName: raw.firstName,
          lastName: raw.lastName,
          phoneNumber: raw.phoneNumber,
          nationalID: raw.nationalID,
          age: raw.age,
        };
        if (raw.password?.trim()) updateData.password = raw.password;
        this.employeeService.updateEmployee(this.employeeId, updateData).subscribe({
          next: () => {
            this.toastService.success('Employee updated successfully');
            this.router.navigate(['/admin/employees']);
          },
          error: (err) => {
            const message = this.getValidationErrorMessage(err);
            this.toastService.error(message);
            this.isLoading = false;
          },
        });
      } else {
        if (!formData.password?.trim()) {
          this.toastService.error('Password is required when adding an employee');
          this.isLoading = false;
          return;
        }
        const createData: EmployeeCreateRequest = {
          userName: formData.userName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          nationalID: formData.nationalID,
          age: formData.age,
          password: formData.password,
        };
        this.employeeService
          .createEmployee(createData)
          .pipe(
            switchMap((response) => {
              const created = (response as { data?: Employee }).data ?? response;
              const newId = (created as Employee).id;
              const hasSignature =
                !!this.signatureFile || !!(this.signature && this.signature.startsWith('data:'));
              if (newId && hasSignature) {
                const file =
                  this.signatureFile ?? this.dataURLToFile(this.signature, 'signature.png');
                return of({ newId, file }).pipe(
                  delay(800),
                  switchMap(({ newId: id }) => this.employeeService.uploadSignature(id, file)),
                  catchError(() => {
                    this.toastService.error('Employee created but signature upload failed');
                    return of(null);
                  })
                );
              }
              return of(true);
            }),
            finalize(() => {
              this.isLoading = false;
            })
          )
          .subscribe({
            next: () => {
              this.toastService.success('Employee created successfully');
              this.router.navigate(['/admin/employees']);
            },
            error: (err) => {
              const message = this.getValidationErrorMessage(err);
              this.toastService.error(message);
            },
          });
      }
    } else {
      this.markFormGroupTouched(this.employeeForm);
    }
  }

  onSignatureChange(signature: string): void {
    this.signature = signature;
    this.cdr.markForCheck();
  }

  onSignatureFileChange(file: File | null): void {
    this.signatureFile = file;
    this.cdr.markForCheck();
  }

  onSignatureExportError(message: string): void {
    this.toastService.error(message);
  }

  uploadSignatureFile(): void {
    if (!this.employeeId || !this.signatureFile) return;
    this.uploadingSignature = true;
    this.employeeService.uploadSignature(this.employeeId, this.signatureFile).subscribe({
      next: () => {
        this.toastService.success('Signature updated successfully');
        this.signatureFile = null;
        this.loadEmployee(this.employeeId!);
        this.uploadingSignature = false;
      },
      error: () => {
        this.toastService.error('Failed to upload signature');
        this.uploadingSignature = false;
      },
    });
  }

  private getValidationErrorMessage(err: {
    error?: { errors?: Record<string, string[]>; title?: string };
  }): string {
    const errors = err?.error?.errors;
    if (errors && typeof errors === 'object') {
      const messages: string[] = [];
      for (const key of Object.keys(errors)) {
        const arr = errors[key];
        if (Array.isArray(arr) && arr.length > 0) {
          messages.push(...arr);
        }
      }
      if (messages.length > 0) {
        return messages.join(' ');
      }
    }
    return err?.error?.title ?? 'An error occurred. Please try again.';
  }

  private dataURLToFile(dataURL: string, filename: string): File {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new File([u8arr], filename, { type: mime });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get firstName() {
    return this.employeeForm.get('firstName');
  }

  get lastName() {
    return this.employeeForm.get('lastName');
  }

  get phoneNumber() {
    return this.employeeForm.get('phoneNumber');
  }

  get userName() {
    return this.employeeForm.get('userName');
  }

  get nationalID() {
    return this.employeeForm.get('nationalID');
  }

  get password() {
    return this.employeeForm.get('password');
  }

  get age() {
    return this.employeeForm.get('age');
  }
}
