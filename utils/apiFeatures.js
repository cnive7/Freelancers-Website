class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    // 1) Filtering
    const queryObj = { ...this.queryString };
    const queryObj2 = {};
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((element) => delete queryObj[element]);
    // 2) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Custom for "like" searching
    for (const [key, value] of Object.entries(JSON.parse(queryStr))) {
      if (key === "rating") {
        queryObj2[key] = value;
      } else {
        queryObj2[key] = {
          $regex: value,
          $options: "i",
        };
      }
    }
    this.query = this.query.find(queryObj2);

    return this;
  }
  filterForProjects() {
    //1) Filtering
    const queryObj = { ...this.queryString };
    const queryObj2 = {};
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((element) => delete queryObj[element]);

    console.log(queryObj);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Custom for "like" searching
    for (const [key, value] of Object.entries(JSON.parse(queryStr))) {
      if (key === "word") {
        queryObj2["$or"] = [
          {
            title: {
              $regex: value,
              $options: "i",
            },
          },
          {
            description: {
              $regex: value,
              $options: "i",
            },
          },
          {
            skills: {
              $regex: value,
              $options: "i",
            },
          },
        ];
      } else {
        queryObj2[key] = value;
      }
    }

    console.log(queryObj2);
    this.query = this.query.find(queryObj2);

    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      console.log(fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v"); // With the - we exclude the field
    }
    return this;
  }
  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 25;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
  paginateProjects() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
