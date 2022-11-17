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
// updates user
 updateUser({ params, body }, res) {
  User.findOneAndUpdate({ _id: params.id }, body, {
    new: true,
    runValidators: true,
  })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: 'No user found with this id' });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => res.status(400).json(err));
},

//delete user by id 
deleteUser({ params }, res) {
  // delete the user
  User.findOneAndDelete({ _id: params.id })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: 'No user found with this id' });
        return;
      }
      // update friends lists to reflect deleted user
      User.updateMany(
        { _id: { $in: dbUserData.friends } },
        { $pull: { friends: params.id } }
      )
        .then(() => {
          // removes all posts by this user 
          Thought.deleteMany({ username: dbUserData.username })
            .then(() => {
              res.json({ message: 'Successfully deleted user: '+username });
            })
            .catch((err) => res.status(400).json(err));
        })
        .catch((err) => res.status(400).json(err));
    })
    .catch((err) => res.status(400).json(err));
},

// add friend by friend id 
addFriend({ params }, res) {
 
  User.findOneAndUpdate(
    { _id: params.userId },
    { $addToSet: { friends: params.friendId } },
    { new: true, runValidators: true }
  )
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: 'No user found with this userId' });
        return;
      }
      // adds friends id to the users id to keep it specific to the user
      User.findOneAndUpdate(
        { _id: params.friendId },
        { $addToSet: { friends: params.userId } },
        { new: true, runValidators: true }
      )
        .then((dbUserData2) => {
          if (!dbUserData2) {
            res
              .status(404)
              .json({ message: 'No user found with this friendId' });
            return;
          }
          res.json(dbUserData);
        })
        .catch((err) => res.json(err));
    })
    .catch((err) => res.json(err));
},


deleteFriend({ params }, res) {
  // removes friend 
  User.findOneAndUpdate(
    { _id: params.userId },
    { $pull: { friends: params.friendId } },
    { new: true, runValidators: true }
  )
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: 'No user found with this userId' });
        return;
      }
      // remove userId from friendId's friend list
      User.findOneAndUpdate(
        { _id: params.friendId },
        { $pull: { friends: params.userId } },
        { new: true, runValidators: true }
      )
        .then((dbUserData2) => {
          if (!dbUserData2) {
            res
              .status(404)
              .json({ message: 'No user found with this friendId' });
            return;
          }
          res.json({ message: 'Successfully deleted the friend' });
        })
        .catch((err) => res.json(err));
    })
    .catch((err) => res.json(err));
},
 

 };

module.exports = userController;