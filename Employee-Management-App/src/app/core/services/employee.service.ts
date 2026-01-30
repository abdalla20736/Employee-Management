import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Employee, EmployeeCreateRequest, EmployeeUpdateRequest } from '../models/employee.model';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface GetEmployeesParams {
  search?: string;
  sortBy?: string;
  ascending?: boolean;
  page?: number;
  pageSize?: number;
}

export interface GetEmployeesResponse {
  data: Employee[];
  isNextPage: boolean;
  page: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private http = inject(HttpClient);

  getEmployees(params: GetEmployeesParams = {}): Observable<GetEmployeesResponse> {
    let httpParams = new HttpParams();
    if (params.search != null && params.search !== '') {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.sortBy != null && params.sortBy !== '') {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.ascending != null) {
      httpParams = httpParams.set('ascending', params.ascending.toString());
    }
    if (params.page != null && params.page > 0) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.pageSize != null && params.pageSize > 0) {
      httpParams = httpParams.set('pagesize', params.pageSize.toString());
    }
    return this.http.get<GetEmployeesResponse>(API_ENDPOINTS.EMPLOYEES, {
      params: httpParams,
    });
  }

  getTotalEmployeesCount(): Observable<number> {
    return this.getEmployees({ page: 1, pageSize: 1000000 }).pipe(map((res) => res.total ?? 0));
  }

  getEmployeeById(id: string): Observable<Employee> {
    return this.http.get<Employee>(API_ENDPOINTS.EMPLOYEE_BY_ID(id));
  }

  createEmployee(employee: EmployeeCreateRequest): Observable<Employee> {
    return this.http.post<Employee>(API_ENDPOINTS.EMPLOYEES, employee);
  }

  updateEmployee(id: string, employee: EmployeeUpdateRequest): Observable<Employee> {
    return this.http.put<Employee>(API_ENDPOINTS.EMPLOYEE_BY_ID(id), employee);
  }

  deleteEmployee(id: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.EMPLOYEE_BY_ID(id));
  }

  uploadSignature(employeeId: string, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(API_ENDPOINTS.UPLOAD_SIGNATURE(employeeId), formData, {
      responseType: 'text',
    });
  }
}
