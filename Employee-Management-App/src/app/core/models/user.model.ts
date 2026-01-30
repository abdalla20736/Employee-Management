export interface User {
  age: number;
  electronicSignature?: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phoneNumber: string;
  role: 'Admin' | 'Employee';
  token?: string;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse extends User {
  token: string;
}
