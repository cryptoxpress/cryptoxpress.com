function truncateString(str, minLen = 10) {
  if (str.length > minLen) {
    return str.slice(0, minLen) + "...";
  } else {
    return str;
  }
}
