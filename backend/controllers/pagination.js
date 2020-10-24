module.exports = (page, perPage, totalRecords) => {
  page = page;
  perPage = perPage;
  start = (page - 1) * perPage;
  end = page * perPage;
  totalRecords = totalRecords;
  totalPages = Math.ceil(totalRecords.length / perPage);
  records = totalRecords.slice(start, end);
  return { records, totalPages, page };
};
