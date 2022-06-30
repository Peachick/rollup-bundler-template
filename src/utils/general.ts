interface IThrottle {
  (cb: (...args: any) => any, wait?: number): (...args: any) => void;
}
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
