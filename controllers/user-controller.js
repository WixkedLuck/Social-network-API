const { User, Thought } = require('../models');

const userController = {
  //find all users 
  getAllUsers(req, res) {
    User.find({})
      .select('-__v')
      .then((dbUserData) => res.json(dbUserData))
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },

  //find user and display friends/thoughts 
  getUserById({ params }, res) {
    User.findOne({ _id: params.id })
      .populate([
        { path: 'thoughts', select: '-__v' },
        { path: 'friends', select: '-__v' },
      ])
      .select('-__v')
      .then((dbUserData) => {
        if (!dbUserData) {
          res.status(404).json({ message: 'No user found with this id' });
          return;
        }
        res.json(dbUserData);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  //create user
  createUser({ body }, res) {
    User.create(body)
      .then((dbUserData) => res.json(dbUserData))
      .catch((err) => res.status(400).json(err));
  },

 

 };

module.exports = userController;