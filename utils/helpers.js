exports.getExtension = function (mimetype) {
  let extension;
  if (
    mimetype.endsWith(
      "vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
  ) {
    extension = "docx";
  } else if (mimetype.endsWith("msword")) {
    extension = "doc";
  } else if (
    mimetype.endsWith("vnd.openxmlformats") ||
    mimetype.endsWith(
      "vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) ||
    mimetype.endsWith("officedocument.spreadsheetml.sheet")
  ) {
    extension = "xlsx";
  } else if (mimetype.endsWith("vnd.ms-excel")) {
    extension = "xls";
  } else if (mimetype.endsWith("pdf")) {
    extension = "pdf";
  } else if (mimetype.endsWith("x-zip-compressed")) {
    extension = "zip";
  } else if (mimetype.endsWith("zip-compressed")) {
    extension = "zip";
  } else if (mimetype.endsWith("svg+xml")) {
    extension = "svg";
  } else if (mimetype.endsWith("vnd.ms")) {
    extension = "csv";
  } else if (mimetype.endsWith("x-flv")) {
    extension = "flv";
  } else if (mimetype.endsWith("plain") || mimetype.endsWith("x-log")) {
    extension = "txt";
  } else {
    extension = mimetype.split("/")[1];
  }
  return extension;
};
