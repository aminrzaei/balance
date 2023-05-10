const getSQLDatetime = () => {
  const date = new Date();
  const sqlDate = `${date.getFullYear()}-${`00${date.getMonth() + 1}`.slice(
    -2
  )}-${`00${date.getDate()}`.slice(-2)} ${`00${date.getHours()}`.slice(
    -2
  )}:${`00${date.getMinutes()}`.slice(-2)}:${`00${date.getSeconds()}`.slice(
    -2
  )}`;
  return sqlDate;
};

module.exports = getSQLDatetime;
