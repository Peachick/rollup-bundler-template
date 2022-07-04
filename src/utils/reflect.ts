/**
 * 反射相关
 *
 * ES6 Reflect：
 *  1. 将Object上相关的方法或属性搬到Reflect上
 *  2. Reflect对象方法与Proxy对象的方法一一对应
 *  3. 13个静态方法
 *
 * reflect-metadata：
 *  1.getMetadata
 *  2.setMetadata
 */
import 'reflect-metadata';

export function boostrapReflect() {
  const log = (t: string, ...args: any) =>
    console.log(`Reflect ${t}: `, ...args);

  const level = Symbol('level');
  const hobbies = Symbol('hobbies');
  const user = {
    firstname: 'Ming',
    lastname: 'Mr',
    age: 2,
    get fullname() {
      return this.lastname + ' ' + this.firstname;
    },
    [level]: 'A',
    introduce(orther?: any): string {
      return `I'm ${this.firstname}, ${this.age} age, ${orther}.`;
    },
  };
  Object.setPrototypeOf(user, { school: '光明小学', grade: 4 });
  // @ts-ignore
  window.User = user;

  /**
   * 原生的Reflect静态方法
   *
   */
  // 1. apply [Func, thisArg[,args]]
  const apply = (func: Function, thisArg: any, args?: any[]) =>
    Reflect.apply(func, thisArg, args);

  log('apply', apply(Math.max, Math, [1, 2, 3, 4, 5]));

  // 2. get [target, prop[,receiver]]
  log('get', Reflect.get(user, 'fullname'));
  log(
    'get',
    Reflect.get(user, 'fullname', { firstname: 'Long', lastname: 'Mrs' }),
  );

  // 3. set [target, prop, value[,receiver]]
  Reflect.set(user, 'grade', 1);
  log('set', user);
  const p = new Proxy(user, {
    set(target, prop, value, receiver) {
      // reveiver是proxy对象，通过Reflect.set传入receiver会触发proxy的defineProperty方法
      console.log(receiver);
      Reflect.set(target, prop, value, receiver);
      return true;
    },
    defineProperty(target, prop, attr) {
      console.log('defineProperty: ', attr);
      Reflect.defineProperty(target, prop, {
        ...attr,
      });
      return true;
    },
  });
  // @ts-ignore
  p.a = 1;

  // 4.has [target, prop] 相当于Object in
  log('has', level, Reflect.has(user, level));

  // 5.deleteProperty[target, prop] => delete target[prop]
  log('deleteProperty', 'grade', Reflect.deleteProperty(user, 'grade'));

  // 6.construct(target, args: any[]) => new Class(...args)
  class Demo {
    constructor(public name?: string, public age?: number) {}
  }
  log('construct', Reflect.construct(Demo, ['Mr Ming', 1]));

  // 7.getPrototypeOf[target] => Object.getPrototypeOf[target]
  log('getPrototypeOf', Reflect.getPrototypeOf(user));

  // 8.setPrototypeOf[target, protoTarget] => Object.setPrototypeOf(target, protoTarget)
  log(
    'setPrototypeOf',
    user,
    Reflect.setPrototypeOf(user, { height: '1.7m', weight: '65kg' }),
  );

  // 9.defineProperty[target, prop, attr]
  log(
    'defineProperty',
    user,
    Reflect.defineProperty(user, hobbies, {
      enumerable: false,
      value: ['backetball', 'soccer', 'pingpang'],
    }),
  );

  // 10.getOwnPropertyDescriptor[target, prop]
  log(
    'getOwnPropertyDescriptor',
    Reflect.getOwnPropertyDescriptor(user, hobbies),
  );

  // 11.isExtensible[target] 判断一个对象是否可以扩展
  log('isExtensible', Reflect.isExtensible(user));

  // 12.preventExtensions[target] 让一个对象可扩展
  log('preventExtensions', Reflect.preventExtensions(user));

  // 13.ownKeys[target] => Object.getOwnPropertyNames与Object.getOwnPropertySymbols之和
  log('ownKeys', Reflect.ownKeys(user));

  console.log(`\n\nAbove is the es7 syntax\n\n`);

  /**
   * reflect-metadata方法
   *  1. metadata: 在类的所有装饰器使用（定义元数据）
   *  2. defineMetadata: 定义对象或属性的元数据
   *  3. getMetadata: 获取对象或属性上定义的元数据
   *  4. hasMetadata: 检查对象或属性上的元数据键是否存在 （会找原型链）
   *  5. hasOwnMetadata: 判断对象或属性本身 元数据键是否存在
   *  6. getOwnMetadata: 获取对象或属性自身上的元数据
   *  7. getMetadataKeys: 获取对象或属性上的元数据键
   *  8. getOwnMetadataKeys: 获取对象或属性自身上的元数据键
   *  9. deleteMetadata: 删除对象或属性上的元数据
   *
   *  getMetadata的参数：'design:type', 'design:paramtypes', 'design:returntype'只能在类中使用
   */
  const classDecorator = Symbol('classDecorator');
  // 返回类型装饰器
  function returnTypeDecorator(target: any, prop: string, value: PropertyDescriptor) {
    const returnType = Reflect.getMetadata('design:returntype', target, prop);
    const type = String(returnType).match(/function (\w+)/i)?.[1]?.toLowerCase() || undefined;
    console.log('return type: ', type);
  }
  // 参数装饰器
  function paramTypesDecorator(target: any, prop: string, descriptor: PropertyDescriptor) {
    // 获取当前方法所有参数的类型
    const paramTypes: Function[] = Reflect.getMetadata('design:paramtypes', target, prop);
    console.log('paramtypes: ', getTypes(paramTypes));

    function getTypes(types: Function[]) {
      return types.map(type => String(type).match(/function (\w+)/i)?.[1]?.toLowerCase() || undefined);
    }
  }
  // 属性装饰器
  function propertyDecorator(target: Record<string|symbol, any>, prop: string | symbol) {
    const propertyType = Reflect.getMetadata('design:type', target, prop);
    console.log(propertyType);
    console.log('propertytype: ', String(propertyType).match(/function (\w+)/i)?.[1]?.toLowerCase() || undefined);
  }
  @Reflect.metadata(classDecorator, 'class value')
  class TestDemo {
    @propertyDecorator
    _timer: TestDemo;

    @returnTypeDecorator
    @paramTypesDecorator
    introduce(name?: string, age?: number, crt?: Symbol, func?: Function, bool?: boolean, list?: number[]): string {
      return name;
    };
  }
  // 1.defineMetadata (key, val, target) => void 定义元数据
  Reflect.defineMetadata('animal', ['cat', 'dog'], user);  // user 自身上定义元数据
  Reflect.defineMetadata('fruit', ['apple', 'banana', 'watermelon'], Reflect.getPrototypeOf(user)); // user 原型上定义元数据

  // 2.getMetadata (key, target) => any 获取元数据
  const d1 = Reflect.getMetadata('animal', user);
  const d2 = Reflect.getMetadata('fruit', user);
  log('getMetadata (获取defineMetadata的值)', d1);
  log('getMetadata (获取defineMetadata的值(原型))', d2);
  log(
    'getMetadata (@Reflect.metadata[target, value])',
    Reflect.getMetadata(classDecorator, TestDemo),
  );
  log(
    'getMetadata (design:returntype只能用在类的装饰器中)',
    Reflect.getMetadata('design:returntype', user, 'introduce'),
  );

  // 3.hasMetadata (key, target) => boolean 检查元数据键是否存在
  log('hasMetadata', Reflect.hasMetadata('animal', user));

  // 4.hasOwnMetadata (key, target) => boolean 检查对象或属性自身上的元数据键是否存在
  log('hasOwnMetadata (hasOwnMetadata获取对象本身上定义的元数据)', Reflect.hasOwnMetadata('animal', user));
  log('hasOwnMetadata (hasOwnMetadata获取对象本身上定义的元数据)', Reflect.hasOwnMetadata('fruit', user));

  // 5.getOwnMetadata (key, target) => any 获取对象或属性上自身的元数据
  log('getOwnMetadata (animal定义在自身上)', Reflect.getOwnMetadata('animal', user));
  log('getOwnMetadata (fruit定义在原型上获取不到)', Reflect.getOwnMetadata('fruit', user));

  // 6.getMetadataKeys (target) => Array 获取对象或属性上定义的元数据键
  log('getMetadataKeys (获取对象或属性上定义的元数据键)', Reflect.getMetadataKeys(user));

  // 7.getOwnMetadataKeys (target) => Array 获取对象或属性自身上定义的元数据键
  log('getOwnMetadataKeys (获取对象或属性自身上定义的元数据键)', Reflect.getOwnMetadataKeys(user));

  // 8.deleteMetadata (key, target) => boolean 删除对象或属性上定义的元数据
  log('deleteMetadata (删除对象或属性上定义的元数据 animal)', Reflect.deleteMetadata('animal', user));
  log('getMetadata (重新获取被删除的元数据 animal)', Reflect.getMetadata('animal', user));
}
