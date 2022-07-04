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
    introduce(orther?: any) {
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

  console.log(`\n\n以上是原生静态方法\n\n`);

  /**
   * reflect-metadata方法
   */
  // 1.(key, val, target) => void
  Reflect.defineMetadata('animal', ['cat', 'dog'], user);
  // 2.(key, target) => any
  const d1 = Reflect.getMetadata('animal', user);
  log('getMetadata', d1);
  log(
    'getMetadata',
    Reflect.getMetadata('design:paramtypes', user, 'introduce'),
  );
}
