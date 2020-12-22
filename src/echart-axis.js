/**
 * 保留两位小数
 * @param {*} num 要处理的数值
 * @param {*} baseNum 基础数值，用作除数
 */
export const getKeepTwoDigits = (num = 0, baseNum = 1) => {
  const val = num / baseNum;

  return val.toFixed(2);
};

/**
 * 获取数值的长度
 * @param {*} num 要处理的数值
 */
export const getNumLen = (num: number) => {
  const idx = String(num).indexOf('.') + 1; //小数点的位置

  return idx > 0 ? String(num).length - idx : 0; //小数的位数
};

/**
 * echart axis的自动计算
 * @param {*} list series.data 数据
 * @param {*} splitNumber 想要 axis 分成几段
 */
export const getAxis = (list: number[], splitNumber = 4) => {
  let axisMax = Math.max(...list.flat(9));
  const axisMin = Math.min(...list.flat(9));

  // 不能整除，将其设为最小可整除数值
  if ((axisMax % splitNumber !== 0 || axisMax % 1000 !== 0) && axisMax > 10) {
    let average = Math.ceil(axisMax / splitNumber);
    const pow = (average + '').length - 2 - getNumLen(average); // 基准值的次方数，值越大，距离越大
    const baseNum = Math.pow(10, pow > 1 ? pow : 1);
    const remainder = average % baseNum; // 整除余数

    if (remainder !== 0) {
      average += baseNum - remainder;
    }

    axisMax = average * splitNumber;
  }

  if (axisMax < 10) {
    let average = axisMax / splitNumber;
    const decimalNum = getNumLen(average);

    if (decimalNum > 2) {
      const baseNum = Math.pow(10, decimalNum - 1);
      average = Number.parseFloat(getKeepTwoDigits(Math.ceil(average * baseNum) / baseNum));

      axisMax = average * splitNumber;
    }
  }

  const axis: {
    max: string;
    interval: number;
    min?: string;
  } = {
    max: getKeepTwoDigits(axisMax),
    interval: Number.parseFloat(getKeepTwoDigits(axisMax / splitNumber))
  };

  if (axisMin < 0 && Number.parseFloat(axis.max) > 0) {
    axis.interval = Math.ceil((Number.parseFloat(axis.max) - axisMin) / splitNumber);
    axis.max = String(axis.interval * Math.ceil(Number.parseFloat(axis.max) / axis.interval));
  }

  if (Number.parseFloat(axis.max) < 0) {
    axis.interval = Math.abs(axis.interval);

    axis.min = axis.max;
    axis.max = '0';
  }

  return axis;
};
