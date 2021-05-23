/* eslint-disable no-undef */
const { compare } = require('bcrypt');
const { validationResult } = require('express-validator');
const { sign } = require('jsonwebtoken');

const { jwt } = require('../config/serverConfig');
const { responseMsg } = require('../helpers/utils');

exports.jwtLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(responseMsg(errors.array()));
    }

    // const userData = await model('User').findOne({ username: req.body.username });
    // const userData = await model('User').findAll({ where: { username: req.body.username } });
    // Note: If using Sequelize, update userData to userData[0] for all the following occurrences
    let token = '';
    if (userData && await compare(req.body.password, userData.password)) {
      token = sign(
        {
          username: userData.username,
          // eslint-disable-next-line no-underscore-dangle
          userId: userData._id.toString()
        },
        jwt.secret,
        { expiresIn: jwt.expireIn }
      );
    }
    if (token) {
      return res.json(responseMsg(null, true, { token }));
    }
    return res.status(404).json(responseMsg('User not found!'));
  } catch (error) {
    console.error(error);
    return res.status(500).json(responseMsg('Something went wrong!'));
  }
};

exports.jwtLogout = async (req, res) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        await model('Blacklist').create({
          token,
          user: req.userId
        });
      }
      return res.json(responseMsg(null, true, 'Successfully logged out!'));
    }
    return res.status(401).json(responseMsg('Not authenticated!'));
  } catch (error) {
    console.error(error);
    return res.status(500).json(responseMsg('Something went wrong!'));
  }
};
