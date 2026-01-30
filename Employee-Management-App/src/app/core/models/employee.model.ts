export interface Employee {
  id?: string;
  userName?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalId?: string;
  nationalID?: string;
  age: number;
  electronicSignature?: string;
  email?: string;
}

export interface EmployeeCreateRequest {
  userName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalID: string;
  age: number;
  electronicSignature?: string;
  password: string;
}

export interface EmployeeUpdateRequest {
  userName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  nationalID?: string;
  age?: number;
  electronicSignature?: string;
  password?: string;
}
