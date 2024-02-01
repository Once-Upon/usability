import { makeTransform } from '../helpers/utils';
// import { transformer1 } from './transformer1';

const children = {
  // transformer1,
};

const transformers = Object.fromEntries(
  Object.keys(children).map((key) => [key, children[key].transform]),
);

const transform = makeTransform(transformers);

export const transformer = {
  transform,
  children,
};
