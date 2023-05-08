const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

//? CREATE
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

//? DELETE
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with this ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

//? UPDATE
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError("No document found with this ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

//? GET
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with this ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

//? GET All
exports.getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query
    if (req.user.roles.includes("Employee") && Model.modelName === "Note") {
      query = Model.find({user: req.user._id});
    } else {
      query = Model.find();
    }

    if(popOptions) query.populate(popOptions);
    query.select("-__v")

    const docs = await query;

    res.status(200).json({
      status: "success",
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
