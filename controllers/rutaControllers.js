const Ruta = require('../models/rutaModel');

//2) Handlers - Controllers
const getAllRutas = async (req, res) => {
  try {
    console.log(req.query);
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
    res.status(400).json({
      status: 'Fail',
      message: 'Fail to get All Rutas',
      error,
    });
  }
};
const createOneRuta = async (req, res) => {
  try {
    const newRuta = await Ruta.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'New Ruta Created',
      data: {
        newRuta,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Fail',
      message: 'Fail to create Ruta',
      error,
    });
  }
};
const updateOneRuta = async (req, res) => {
  try {
    const ruta = await Ruta.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(201).json({
      status: 'Success',
      data: {
        ruta,
      },
    });
  } catch (error) {
    res.status(400).json({ status: 'Fail', message: 'fail to update ruta' });
  }
};
const getOneRuta = async (req, res) => {
  try {
    const ruta = await Ruta.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        ruta,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'Fail',
      message: 'Fail to get One Ruta',
      error,
    });
  }
};
const deleteOneRuta = async (req, res) => {
  try {
    await Ruta.findByIdAndDelete(req.params.id, { new: true });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({ status: 'Fail', message: 'fail to delete Tour' });
  }
};

module.exports = {
  getAllRutas,
  createOneRuta,
  getOneRuta,
  updateOneRuta,
  deleteOneRuta,
};
