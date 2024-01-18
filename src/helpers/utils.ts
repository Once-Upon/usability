export const makeTransform = (
    children: Record<string, (transaction: any) => any>,
  ) => {
    return (transaction: any): any => {
      for (const childTransformer of Object.values(children)) {
        const result = childTransformer(transaction);
        if (result) {
          return result;
        }
      }
      return transaction;
    };
  };

  export function shortenTxHash(hash: string): string {
    if (hash.length <= 10) return hash;
    return hash.substr(0, 6) + hash.substr(-4);
  }