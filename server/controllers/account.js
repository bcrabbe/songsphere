var AccountController = function (userModel, session) {
    this.crypto = require('crypto');
    this.uuid = require('node-uuid');
    this.ApiResponse = require('../models/api-response.js');
    this.ApiMessages = require('../models/api-messages.js');
    this.UserProfile = require('../models/user-profile.js');
    this.userModel = userModel;
    this.session = session;
    this.User = require('../models/user.js');
};

AccountController.prototype.getSession = function () {
    return this.session;
};

AccountController.prototype.setSession = function (session) {
    this.session = session;
};

AccountController.prototype.hashPassword = function (password, salt, callback) {
    var iterations = 10000,
        keyLen = 64;
    this.crypto.pbkdf2(password, salt, iterations, keyLen, callback);
};

AccountController.prototype.register = function (newUser, callback) {
    var me = this;
    me.userModel.findOne({ username: newUser.username }, function (err, user) {
        if (err) {
            return callback(err,new me.ApiResponse({ success: false,extras: { msg: me.ApiMessages.DB_ERROR } }));
        }
        if (user) {
            return callback(err, new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.USERNAME_ALREADY_EXISTS } }));
        } else {
            newUser.save(function (err, user, numberAffected) {
                if (err) {
                    return callback(err, new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.DB_ERROR } }));
                }
                if (numberAffected === 1) {
                    var userProfileModel = new me.UserProfile({
                        email: user.email,
                        username: user.username,
                    });
                    return callback(err, new me.ApiResponse({success: true, extras: {userProfileModel: userProfileModel}}));
                } else {
                    return callback(err, new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.COULD_NOT_CREATE_USER } }));
                }
            });
        }
    });
};

AccountController.prototype.logon = function(username, password, callback) {
    var me = this;
    me.userModel.findOne({ username: username }, function (err, user) {
        if (err) {
            return callback(err, new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.DB_ERROR } }));
        }
        if (user) {
            me.hashPassword(password, user.passwordSalt, function (err, passwordHash) {
                if (passwordHash.toString('hex') === user.passwordHash) {
                    var userProfileModel = new me.UserProfile({
                        email: user.email,
                        username: user.username,
                    });
                    me.session.userProfileModel = userProfileModel;
                    me.session.id = me.uuid.v4();
                    return callback(err, new me.ApiResponse({
                        success: true, extras: {
                            userProfileModel: userProfileModel,
                            sessionId: me.session.id
                        }
                    }));
                } else {
                    return callback(err, new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.INVALID_PWD } }));
                }
            });
        } else {
            return callback(err, new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.USERNAME_NOT_FOUND } }));
        }
    });
};

AccountController.prototype.logoff = function () {
    if (this.session.userProfileModel) delete this.session.userProfileModel;
    if (this.session.id) delete this.session.id;
    return;
};

AccountController.prototype.getUserFromUserRegistration = function(userRegistrationModel) {
    var me = this;
    if (userRegistrationModel.password !== userRegistrationModel.passwordConfirm) {
        return new me.ApiResponse({ success: false, extras: { msg: me.ApiMessages.PASSWORD_CONFIRM_MISMATCH } });
    }
    var passwordSaltIn = this.uuid.v4(),
        cryptoIterations = 10000,
        cryptoKeyLen = 64,
        passwordHashIn;
    var user = new this.User({
        username: userRegistrationModel.username,
        email: userRegistrationModel.email,
        passwordHash: this.crypto.pbkdf2Sync(userRegistrationModel.password, passwordSaltIn, cryptoIterations, cryptoKeyLen).toString('hex'),
        passwordSalt: passwordSaltIn
    });
    return new me.ApiResponse({ success: true, extras: { user: user } });
}

module.exports = AccountController;