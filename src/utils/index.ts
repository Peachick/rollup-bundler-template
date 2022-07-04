export * from './common';
export * from './general';
export * from './decorator';
export * from './reflect';

export const isEmtry = (param: any) =>
  param == undefined ||
  param == null ||
  (typeof param === 'string' && !param.length);
