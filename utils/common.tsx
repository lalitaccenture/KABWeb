export const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  export const convertToIntegers = (numbers: number[]) => numbers.map(Math.trunc);

  export const formatToTwoDecimals = (numbers: number[]) => numbers.map(num => num.toFixed(2));
