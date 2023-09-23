const Ruta = require('../models/rutaModel');
const AppError = require('../utils/appError');

//2) Handlers - Controllers
const getAllRutas = async (req, res, next) => {
  try {
    //Build Query
    //1) Filtering
    const queryObj = { ...req.query }; //New Object
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    //2)Advance Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); //greaterthanequal|greaterthan|lessthanequal|lessthan

    let query = Ruta.find(JSON.parse(queryStr));

    //3)Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy); //
    } else {
      query = query.sort('-createdAt');
    }

    //4)Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v'); //the minus exludes
    }

    //5) Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const skipVal = (page - 1) * limit;

    query = query.skip(skipVal).limit(limit);

    if (req.query.page) {
      const numRutas = await Ruta.countDocuments();
      if (skipVal >= numRutas) throw new Error('This page does not exist');
    }

    //Execute Query
    const rutas = await query;
    console.log(req.user);

    //Send response
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: rutas.length,
      data: {
        rutas,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 404, error));
  }
};
const createOneRuta = async (req, res, next) => {
  try {
    const { company, id } = req.user;

    const preRuta = await { ...req.body, company, userId: id };
    console.log(preRuta);

    const newRuta = await Ruta.create(preRuta);

    res.status(201).json({
      status: 'success',
      message: 'New Ruta Created',
      data: {
        newRuta,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 404, error));
  }
};
const updateOneRuta = async (req, res, next) => {
  try {
    const ruta = await Ruta.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!ruta) {
      return next(new AppError('No Tour found with that ID', 404));
    }

    res.status(201).json({
      status: 'Success',
      data: {
        ruta,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 404, error));
  }
};
const getOneRuta = async (req, res, next) => {
  try {
    const ruta = await Ruta.findById(req.params.id);

    if (!ruta) {
      return next(new AppError('No Tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        ruta,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 404, error));
  }
};
const deleteOneRuta = async (req, res, next) => {
  try {
    const ruta = await Ruta.findByIdAndDelete(req.params.id, { new: true });

    if (!ruta) {
      return next(new AppError('No Tour found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(new AppError(error.message, 404, error));
  }
};

//MONGODB Agrregation Pipeline
const getRutaStats = async (req, res) => {
  try {
    const stats = await Ruta.aggregate([
      {
        $match: { startPoint: 'Queretaro' },
      },
      {
        $group: {
          _id: '$endPoint',
          numRutas: { $sum: 1 },
          avgPrice: { $avg: '$price' },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
const getAllRutasVigentes = async (req, res) => {
  try {
    const stats = await Ruta.aggregate([
      {
        $match: { initialDate: { $gte: new Date() } },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

module.exports = {
  getAllRutas,
  createOneRuta,
  getOneRuta,
  updateOneRuta,
  deleteOneRuta,
  getRutaStats,
  getAllRutasVigentes,
};
