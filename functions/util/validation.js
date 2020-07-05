const isEmpty = (string) => {
  return string.trim() === "";
};

const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email.match(regEx);
};

exports.validateSignUpData = (data) => {
  let errors = {};
  if (isEmpty(data.email)) {
    errors.email = "Cannot be empty";
  } else if (!isEmail(data.email)) {
    errors.email = "Must be a valid email address";
  }

  if (isEmpty(data.password)) {
    errors.password = "Cannot be empty";
  }
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  if (isEmpty(data.username)) {
    errors.username = "Cannot be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
};

exports.validateLoginData = (data) => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = "Cannot be empty";
  }
  if (isEmpty(data.password)) {
    errors.password = "Cannot be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
};

exports.reduceUserInfo = (data) => {
  let userInfo = {};

  if (!isEmpty(data.bio.trim())) {
    userInfo.bio = data.bio;
  }
  if (!isEmpty(data.location.trim())) {
    userInfo.location = data.location;
  }

  return userInfo;
};
