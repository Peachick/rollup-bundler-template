export const bigNumberAdd = (x: number, y: number): any => {
  if (!x || !y) throw new Error("type is error.")
  let x1 = String(x).split('').reverse();
  let y1 = String(y).split('').reverse();
  const len = Math.max(x1.length, y1.length);
  const result = [];
  const toNumber = (val: any) => {
    if (!val) return 0;
    if (typeof val === "number") return val
    if (!isNaN(Number(val))) return Number(val)
    return 0
  }

  let temp = 0

  for (let i = 0; i < len; i++) {
    const total = toNumber(x1[i]) + toNumber(y1[i]) + temp
    result[i] = total % 10
    temp = Math.floor(total / 10)
  }
  temp > 0 ? result.push(temp) : null;
  let rs = result.reverse().join('')
  while(rs.indexOf("0") === 0) {
    rs = rs.slice(1)
  }
  return {
    value: rs,
    size: rs.length,
    args: [x, y],
    arg1: {
      value: x,
      length: x1.length,
    },
    arg2: {
      value: y,
      length: y1.length
    }
  }
}
