var UserRegistration = function(cnf) {
    this.email = cnf.email,
    this.username = cnf.username,
    this.password = cnf.password,
    this.passwordConfirm = cnf.passwordConfirm
};
module.exports = UserRegistration;
