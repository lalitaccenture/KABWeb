export const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  export const convertToIntegers = (numbers: number[]) => numbers.map(Math.trunc);

  export const formatToTwoDecimals = (numbers: number[]) => numbers.map(num => num.toFixed(2));

  export const formatNumberMillion = (num: number): string => {
    return  num >= 1e5 ? (num / 1e6).toFixed(2) + " M" : num.toString();
  };
