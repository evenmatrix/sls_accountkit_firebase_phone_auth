export interface Errors {
  errors: [ValidationError];
}

export interface ValidationError {
  [field: string]: Error;
}

export interface Error {
  key: string;
  message: string;
}
