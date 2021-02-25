import _ from "lodash";

/**
 * 四舍五入
 * @param { Number } num 需要四舍五入的值
 * @param { Number } bit 四舍五入后保留的位数，当大于值的位数和小于0，返回原值
 * @param { range } Boolean 是否递归进行四舍五入
 *
 * 例：
 * round(3.889, 1) ---> 3.9
 * round(3.889, 2) ---> 3.89
 * round(3.889, 2, true) ---> 4
 */
export function round(num, bit = 0, range = false) {
  if (bit === 0) {
    return Math.round(num);
  } else if (bit < 0) {
    // 不进行四舍五入
    return num;
  } else {
    let tmp = Math.round(num * Math.pow(10, bit)) / Math.pow(10, bit);

    if (range) {
      return round(tmp, bit - 1, range);
    }

    return tmp;
  }
}

/**
 * 保留2位小数
 * @param { String | Number } num 数字
 * @param { Boolean | Number } isSave 传入布尔值保留两位小数，传入数值表示保留的位数
 * @param { Number } bit 四舍五入后保留的位数，当大于值的位数和小于0，返回原值。优先进行四舍五入
 * @param { Boolean } range 是否递归进行四舍五入
 * @returns { String }
 */
export const reservedDecimalNum = (
  num = 0,
  isSave = true,
  bit = 2,
  range = false
) => {
  if (isNaN(num)) {
    num = 0;
  }

  let tmpNum = Math.abs(Number.parseFloat(num));

  let result = round(tmpNum, bit, range);

  if (isSave) {
    let saveLen = !_.isBoolean(isSave) ? (_.isNumber(isSave) ? isSave : 2) : 2;
    let len = (("" + result).split(".")[1] || []).length;
    let prev = saveLen - len;

    if (prev > 0) {
      if (prev === saveLen) {
        result += "." + new Array(prev + 1).join("0");
      } else if (prev) {
        result += new Array(prev + 1).join("0");
      }
    } else if (prev < 0) {
      result = result.toString().substring(0, result.toString().length + prev);
    }
  } else if (result !== Math.round(result)) {
    result = Math.round(result);
  }

  return result + "";
};

/**
 * 随机数值数组
 * @param { Number } num 随机数值的基准，以此进行0-1倍数的变化
 * @param { Number } [len] 随机数值数组长度，默认为10，可选
 */
export const randomArr = (num, len = 10) => {
  return new Array(len)
    .join(",")
    .split(",")
    .map((v, i) => Math.floor(Math.random() * num))
    .sort(() => 0.5 - Math.random());
};

/**
 * 对象转换key
 * @param { Object } obj 要转换的对象
 * @param { Object } opts 转换的参数, key 原有的，value 即将转为的key
 */
export const objSwitch = (obj = {}, opts = {}) => {
  let newObj = _.cloneDeep(obj);

  for (let k of Object.keys(opts)) {
    newObj[opts[k]] = _.cloneDeep(obj[k]) || "";

    delete newObj[k];
  }

  return newObj;
};

/**
 * 取随机值
 * @param { Number } start - 只传入当前值表示，最大的随机值，否则表示最小随机值
 * @param { Number } [end] - 表示最大的随机值，可选
 * @returns { Number }
 */
export function random(start, end) {
  if (!end) return Math.floor(Math.random() * start);
  return Math.floor(Math.random() * Math.abs(end - start) + start);
}

/**
 * 千位分割数字
 * @param { Number } num
 */
export const changeNum = num => {
  const bit = 4;
  let is = false;

  function change(str) {
    if (str.length / bit < 1) {
      return is ? str : num;
    } else if (str.length / bit === 1) {
      return str.substr(0, 1) + "," + str.substr(1, 3);
    } else {
      let tmpStr;
      let len = is ? 3 : 4;

      if (!is) {
        is = true;

        tmpStr = str.substr(0, 1) + "," + str.substr(1, 3);
      } else {
        tmpStr = str.substr(0, 3);
      }

      return tmpStr + "," + change(str.substr(len));
    }
  }

  return change(num.toString());
};

/**
 * 根据当前比例值拿到另个比例的值
 * @param { String } sc 比例值，如3:4
 * @param { Number } scn 当前比例值，如3
 * @param { Number } num 当前值，如900
 */
export function rangNum(sc, scn, num) {
  if (!sc) return;

  num = ~~num;
  scn = ~~scn;

  // 返回相同的值
  if (sc === "任意比例") {
    return num;
  }

  // qita比例zhi
  let scn_ = sc.split(":")[sc.split(":").indexOf(scn.toString()) === 0 ? 1 : 0];

  return (num * scn) / scn_;
}

export const getEv = (
  ev,
  bubble = false,
  stopDefault = false,
  eventType = "MouseEvent" // 三种
) => {
  // 创建event的对象实例。
  const event = document.createEvent(eventType);
  // 3个参数：事件类型，是否冒泡，是否阻止浏览器的默认行为
  event.initMouseEvent(ev, bubble, stopDefault);

  return event;
};

/**
 * 数组去重
 * @param {Array} arr 原数组
 * @param {Boolean} isObj 是否数组内部为对象
 * @param {String} qcVal 数组内部为对象的时候，去重依据值
 */
export function qc(arr, isObj = true, qcVal = "id") {
  if (!isObj) {
    return [...new Set(arr)];
  } else {
    let qc = [...new Set(arr.map(item => item[qcVal]))];
    return arr.filter(item => {
      let index = qc.indexOf(item[qcVal]);

      qc.splice(index, 1);

      return index >= 0;
    });
  }
}

// 获取字符串的字符长度
export const getCharLen = (str = "") =>
  str.replace(/[\u0391-\uFFE5]/g, "cc").length; // 先把中文替换成两个字节的英文，在计算长度

export function resolve(...urls) {
  let newUrl = '',isFolder = false;

  const tmp = urls[urls.length - 1];

  if(typeof tmp === 'boolean') {
    isFolder = urls.pop();
  }

  for (let url of urls) {
    if (!url) {
      continue;
    }

    url = String(url);

    if (url === urls[0]) {
      newUrl = url + '';
      continue;
    }

    newUrl = lastCharSprit(newUrl) + (url.startsWith('/') ? '' : '/') + url;
  }

  // 判断最后一个字符串是否是斜杠
  function lastCharSprit(char, isAddSlash) {
    let newChar = char;
    if (char.lastIndexOf('/') === char.length - 1) {
      newChar = char.substr(0, char.length - 1);
    }

    if (isAddSlash) {
      newChar += '/';
    }

    return newChar;
  }

  return lastCharSprit(newUrl, isFolder);
}

export function downloadFile(url, fileName, target) {
  const doc = window.document;
  const fragment = doc.createDocumentFragment();

  const link = doc.createElement('a');

  link.href = url;

  if (fileName) {
    link.download = fileName;
  }

  if(target) {
    link.target = target;
  }

  fragment.appendChild(link);
  doc.body.appendChild(fragment);

  link.click();

  doc.body.removeChild(link);
}

function dataUrl2Blob(dataUrl, type) {
  const data = dataUrl.split(',')[1];
  const mimePattern = /^data:(.*?)(;base64)?,/;
  const mime = dataUrl.match(mimePattern)[1];
  const binStr = atob(data);
  const len = binStr.length;
  let u8arr = new Uint8Array(len);

  for (var i = 0; i < len; i++) {
    u8arr[i] = binStr.charCodeAt(i);
  }
  return new Blob([u8arr], {type: type || mime});
}

function canvas2Blob(canvas, callback, type, quality) {
  canvas.toBlob(function(blob) {
    callback(blob);
  }, type || 'image/jpeg', quality || 0.8);
  // 第二个参数指定图片格式，如不特别指明，图片的类型默认为 image/png，分辨率为 96dpi
  // 第三个参数用于针对image/jpeg 格式的图片进行输出图片的质量设置
}