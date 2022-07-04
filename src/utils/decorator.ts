/**
 * 装饰器
 */
import 'reflect-metadata';

const services: Map<Constructor, Constructor> = new Map();
type Constructor = { new (...args: any): any };
// 注解装饰器
function Inject<T extends Constructor>(target: T) {
  services.set(target, target);
}
function Service(target: Record<string | symbol, any>, key: string | symbol) {
  const service = services?.get(
    Reflect.getMetadata('design:type', target, key),
  );
  service && (target[key] = new service());
}

// logger装饰器
function logger(target: object, key: string, descriptor: PropertyDescriptor) {
  const origin = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    try {
      const start = +new Date();
      const rs = await origin.call(this, ...args);
      const end = +new Date();
      console.log(`@logger: ${key} api request spend`, `${end - start}ms.`);
      return rs;
    } catch (err) {
      console.log(err);
    }
  };
}

// 私有属性装饰器
function toPrivate(target: object, key: string) {
  let _val: any = undefined;
  Reflect.defineProperty(target, key, {
    enumerable: false,
    configurable: false,
    get() {
      return _val;
    },
    set(val) {
      _val = val;
    },
  });
}

// 常量装饰器
function constant(value: any) {
  return function (target: object, key: string) {
    Reflect.defineProperty(target, key, {
      enumerable: false,
      configurable: false,
      get() {
        return value;
      },
      set() {
        return value;
      },
    });
  };
}

// 不变装饰器
function immutable(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  descriptor.set = function (value: any) {
    return value;
  };
  descriptor.enumerable = true;
}

// 参数装饰器
type ParamerDecorator = (
  target: Record<string | symbol, any>,
  prop: string | symbol,
  paramIdx: number,
) => void;
// 自定义验证器
type Validater = (...args: any) => boolean;
const validatorStorage: Record<string | symbol, Validater[]> = {};
const typeDecoratorFactory =
  (validator: Validater): ParamerDecorator =>
  (target, prop, idx) => {
    const targetValidators = validatorStorage[prop] ?? [];
    targetValidators[idx] = validator;
    validatorStorage[prop] = targetValidators;
  };
const isString = typeDecoratorFactory((str: any) => str?.name === 'Mr Ming');
// 源验证器或自定义参数验证器
function validator(
  target: object,
  prop: string,
  descriptor: PropertyDescriptor,
) {
  // 反射获取参数源类型
  const typeMetaDatas: Function[] = Reflect.getMetadata(
    'design:paramtypes',
    target,
    prop,
  );
  const origin = descriptor.value;
  descriptor.value = function (...args: any[]) {
    const validators = validatorStorage[prop];
    if (args) {
      args.forEach((arg, idx) => {
        // 自定义验证器
        const validate = validators?.[idx];
        // 源类型验证器
        const metaValidate = typeMetaDatas?.[idx];
        const errorMsg = `Failed for parameter: ${prop} at method of ${
          JSON.stringify(target.constructor?.toString())?.match(
            /function (\w+)/i,
          )?.[1]
        }, expect 【${metaValidate.name?.toLowerCase()}】but 【${typeof arg}】`;
        if (validate && !validate(arg)) {
          throw new TypeError(errorMsg);
        }
        // 没有自定义验证器执行默认验证器
        else if (!validate) {
          if (metaValidate !== arg?.constructor) {
            throw new TypeError(errorMsg);
          }
        }
      });
    }
    return origin.call(this, ...args);
  };
}

@Inject
class LoginService {
  @logger
  async postLogin(username: string): Promise<any> {
    const time = Math.floor(Math.random() * 10 * 1000);
    const rs = await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.floor(Math.random() * 26) % 10) {
          resolve(username + ' logined success...');
        } else {
          reject('error');
        }
      }, time);
    });
    return rs;
  }
}

class LoginPage {
  @Service
  public service: LoginService;

  @constant('https://www.baidu.com')
  private _BASE_URL: string;

  get BASE_URL(): string {
    return this._BASE_URL;
  }

  set BASE_URL(url: string) {
    this._BASE_URL = url;
  }

  @toPrivate
  private _PORT: number = 3306;
  get PORT() {
    return this._PORT;
  }
  @immutable
  set PORT(port: number) {
    this._PORT = port;
  }

  @validator
  public async toLogin(username: string) {
    return await this.service?.postLogin(username as unknown as string);
  }
}

// 用户相关接口
@Inject
class UserService {
  public getUser() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          name: '张三',
          age: 18,
          address: '北京',
          phone: '123456789',
          email: 'zhangsan@qq.com',
        });
      }, 2000);
    });
  }
}

class UserPage {
  @Service
  public service: UserService;

  public getUser() {
    console.log(this.service);
    return this.service?.getUser();
  }
}

/**
 * 测试装饰器的执行顺序
 */
// 记录
function trace(key: string): any {
  console.log('evaluate: \t', key);
  return function () {
    console.log('call: \t\t', key);
  };
}

/**
 * 装饰器访问顺序
 *  1. 实例属性：按定义从上往下 => 属性/方法(参数 -> 方法名)/属性访问器
 *  2. 静态属性：按定义从上往下 => 属性/方法(参数 -> 方法名)
 *  3. 构造器参数
 *  4. 类装饰器
 */
// 类装饰器
@trace('Class Decorator')
class People {
  protected _name: string;

  @trace('Static Property _instance')
  public static _instance?: People;

  @trace('Instance Property grade')
  public grade: number;

  constructor(@trace('Constructor Parameter') name: string) {
    this._name = name;
    this.grade = 0;
    this.age = 0;
  }

  @trace('属性访问器')
  public get name() {
    return this._name;
  }

  @trace('Instance Method')
  add(
    @trace('Instance Method Param x') x: number,
    @trace('Instance Method Param y') y: number,
  ): number {
    return x + y;
  }

  @trace('Instance Property age')
  public age: number;

  @trace('Static Method getInstance')
  public static getInstance(
    @trace('Static Method Param name') name: string,
  ): People {
    if (!this._instance) {
      this._instance = new People(name);
    }
    return this._instance;
  }
}

export { LoginPage, UserPage, People };
