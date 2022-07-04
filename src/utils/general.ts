interface IThrottle {
  (cb: (...args: any) => any, wait?: number): (...args: any) => void;
}
/**
 * 节流
 */
export const throttle: IThrottle = (cb, wait = 500) => {
  let timer: any;
  return (...args) => {
    if (timer) return;
    timer = setTimeout(() => {
      cb(...args);
      timer = undefined;
    }, wait)
  }
}

interface IDebounce {
  (cb: (...args: any) => any, wait?: number): (...args: any) => void;
}
/**
 * 防抖
 */
export const debounce: IDebounce = (cb, wait = 500) => {
  let timer: any;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      cb(...args);
    }, wait)
  }
}

declare interface IFibonacci {
  (n: number): number;
}
/**
 * 斐波拉契数列
 * @param n step
 * @returns
 */
export const fibonacci: IFibonacci = (n) => {
  let pre = 0;
  let next = 1;
  if (n === 0) return pre;
  if (n === next) return next;
  let result = 0;
  while (n > 0) {
    result = pre + next;
    pre = next;
    next = result;
    n--;
  }
  return result;
};

/**
 * 队列执行
 * @param queue 待执行的队列
 * @param fn 每个队列的载体
 * @param cb 执行完后的回调
 */
export const runQueue =(queue: Function[], fn: Function, cb: Function) => {
  const step = (idx: number) => {
    if (idx >= queue.length) {
      return cb();
    };
    if (queue[idx]) {
      fn(queue[idx], () => {
        step(idx + 1);
      });
    } else {
      step(idx + 1);
    }
  }
  step(0);
}
