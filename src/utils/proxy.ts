/**
 * proxy:
 * 定义：new Proxy(target, handler)
 * proxy属于元编程，在拦截原生方法时，可以改变原生方法的行为
 * proxy的handler对象拥有的属性或方法和reflect的方法一致，通常和reflect结合使用
 * proxy中的this都是执行proxy实例的对象
 */

export function bootstrapProxy() {
  const log = (t: string, ...args: any) =>
    console.log(`Proxy ${t}: `, ...args);

  const level = Symbol('level');
  const hobbies = Symbol('hobbies');
  const user = {
    _cardId: '123456789',
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
  Object.defineProperty(user, 'hobbies', {
    enumerable: false,
    value: ['sing', 'dance', 'play'],
  })
  Object.setPrototypeOf(user, { school: '光明小学', grade: 4 });
  // 冻结user
  Object.freeze(user);
  // @ts-ignore
  window.User = user;

  // proxy里handler方法中的receiver参数，表示当前的proxy对象
  const proxy = new Proxy(user, {
    // 拦截获取属性操作
    get(target, propKey, revceiver) {
      // 拦截私有属性获取
      if (typeof propKey === "string" && propKey.indexOf('_') === 0) return undefined;
      return Reflect.get(target, propKey);
    },
    // 拦截 属性赋值、defineProperty等操作
    set(target, propKey, value, revceiver) {
      // 拦截私有属性设置
      if (typeof propKey === "string" && propKey.indexOf('_') === 0) return false;
      return Reflect.set(target, propKey, value);
    },
    // 拦截hasProperty方法 in操作符，但不会拦截 for...in和Object.keys方法
    has(target, propKey) {
      if (typeof propKey === "string" && propKey.indexOf('_') === 0) return false;
      return Reflect.has(target, propKey);
    },
    // 拦截delete Property操作
    deleteProperty(target, propKey) {
      // 拦截私有属性删除
      if (typeof propKey === "string" && propKey.indexOf('_') === 0) return false;
      return Reflect.deleteProperty(target, propKey);
    },
    // 拦截defineProperty操作
    defineProperty(target, propKey, descriptor) {
      // 拦截私有属性定义 (会报错 Uncaught TypeError: 'defineProperty' on proxy: trap returned falsish for property _prop)
      if (typeof propKey === "string" && propKey.indexOf('_') === 0) return false;
      return Reflect.defineProperty(target, propKey, descriptor);
    },
    // 拦截Object.getOwnPropertyDescriptor方法
    getOwnPropertyDescriptor(target, propKey) {
      // 拦截私有属性描述符获取
      if (typeof propKey === "string" && propKey.indexOf('_') === 0) return undefined;
      return Reflect.getOwnPropertyDescriptor(target, propKey);
    },
    // 拦截Object.getPrototypeOf方法
    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(target);
    },
    // 拦截Object.isExtensible方法，对象是够可扩展
    // 只能返回boolean，否则强制转换为boolean
    isExtensible(target) {
      // Object.freeze 会冻结对象，返回false，通常返回true
      return Reflect.isExtensible(target);
    },
    // 可扩展对象
    // 拦截Object.preventExtensions
    preventExtensions(target) {
      return Reflect.preventExtensions(target);
    },
    // 返回所有属性的数组，不包括私有属性
    // 拦截：Object.getOwnPropertyNames、Object.getOwnPropertySymbols、Object.keys、for...in
    ownKeys(target) {
      return Reflect.ownKeys(target);
    },
    setPrototypeOf(target, prototype) {
      if (!Reflect.isExtensible(target)) throw new Error('Cannot set prototype on a non-extensible object');
      return Reflect.setPrototypeOf(target, prototype);
    }
  });
  // @ts-ignore
  window.proxy = proxy;
  log('proxy', proxy);

  function sum(x: number, y: number) {
    return x + y;
  }
  const funcProxy = new Proxy(sum, {
    // 拦截方法执行、apply、call
    apply(target, thisArg, argArray) {
      return Reflect.apply(target, thisArg, argArray);
    },
    // 拦截构造函数 new操作
    construct(target, argArray, newTarget) {
      return { value: argArray }
    }
  });
  log('apply sum', funcProxy(1, 2));
  // @ts-ignore
  log('apply construct',( new funcProxy(1, 2)).value);

  // 创建可以被取消的proxy
  const { proxy: revocableProxy, revoke } = Proxy.revocable(user, {
    set(target, p, value, receiver) {
      return Reflect.set(target, p, value, receiver);
    },
  })
  // @ts-ignore
  window.revocableProxy = revocableProxy;
  // @ts-ignore
  window.revoke = revoke;
}
