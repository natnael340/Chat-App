function validator() {
  this.checkinput = (inp) => {
    return /[a-zA-Z0-9_]{3,}/gm.test(inp);
  };
  this.checkemail = (email) => {
    let reg =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    reg.test(email);
  };
  this.chckPassword = (pass) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/.test(
      pass
    );
  };
}

module.exports.validator = validator;
