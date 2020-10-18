interface BaseModel {
  id: string;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: string;
}

interface IUser extends BaseModel {
  username: string;
  email: string;
  provider: string;
  password: string;
  resetPasswordToken: string;
  confirmed: boolean;
  blocked: boolean;
  role: any;
}

interface StrapiServices {
  [prop: string]: any;
}

interface IControllerContext {
  query?: any;
  params?: any;
  state?: IControllerContextState;
  response: ResponseContext;
  request: RequestContext;

  send(data: any): void;
}

interface IControllerContextState {
  user?: IUser;
}

interface ResponseContext {
  badImplementation(error: any): void;

  badRequest(error: any): void;
}

interface RequestContext {
  body: any;
  files: any;
}

interface StrapiPlugin {
  config: any;
  services: StrapiServices;
}

interface StrapiConfig {
  plugins: { [key: string]: any };
}

interface StrapiInstance {
  config: StrapiConfig;
  plugins: { [key: string]: StrapiPlugin };
  services: StrapiServices;
  utils: any;
  log: StrapiLogger;

  query(model: string, plugin?: string): Query;
}

interface StrapiLogger {
  debug(message: string, data: any): void;

  info(message: string, data: any): void;

  warn(message: string, data: any): void;

  error(message: string, data: any): void;
}

interface Id {
  id: any
}

interface SearchQuery {
  _q?: string;
  _limit?: number;
  _start?: number;
}

interface FindQuery {
  _limit?: number;
  _start?: number;

  [prop: string]: any;
}

interface Query {
  find(query?: FindQuery, fields?: string[]): Promise<any[]>;

  findOne(query: FindQuery, fields?: string[]): Promise<any>;

  create(data: any): Promise<any>;

  update(id: Id, data: any): Promise<any>;

  delete(id: Id): Promise<any>;

  count(countBy: any): Promise<number>;

  search(search: SearchQuery): Promise<any[]>;

  countSearch(search: SearchQuery): Promise<number>;
}

const strapi: StrapiInstance;

// PADDLE

interface PaddleOrder extends BaseModel {
  user?: any;
  eventTime: string;
  email?: string;
  alertId: string;
  alertName: string;
  passthrough: string;
  payload: any;
}
