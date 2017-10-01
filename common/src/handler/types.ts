export interface IResponsePayload {
  statusCode: number;
  headers?: any;
  body?: string;
}

export interface IQueryParameters {
  foo: string;
}

export interface IEventPayload {
  httpMethod: string;
  queryStringParameters: IQueryParameters;
  body: string;
  headers: any;
}

export interface ICallback {
  (error: any, result: IResponsePayload): void;
}
