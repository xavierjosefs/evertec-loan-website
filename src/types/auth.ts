export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}
