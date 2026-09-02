/** Sort an array of objects by a key. Mutates and returns `arr`. */
export const sortArrayObjects = (arr, key, type = "desc") => {
  return arr.sort((a, b) => {
    if (type == "desc") {
      if (a[key] > b[key]) return 1;
      if (a[key] < b[key]) return -1;
    } else {
      if (a[key] < b[key]) return 1;
      if (a[key] > b[key]) return -1;
    }
    return 0;
  });
};

/** { page: 2, q: "a b" } -> "page=2&q=a%20b" */
export const objectToQueryParams = (object) => {
  return Object.keys(object)
    .map((key) => `${key}=${encodeURIComponent(object[key])}`)
    .join("&");
};

/** 1500 -> "1.5k", 2400000 -> "2.4M" */
export const shortenNumber = (value) => {
  if (value >= 1e9) {
    return (value / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  } else if (value >= 1e6) {
    return (value / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (value >= 1e3) {
    return (value / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
  } else {
    return value.toString();
  }
};
