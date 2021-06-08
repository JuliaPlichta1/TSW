const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(403).json({
    message: 'Not authenticated'
  });
};

const rejectMethod = (_req, res, _next) => {
  res.sendStatus(405);
};

module.exports = {
  isAuth: isAuth,
  rejectMethod: rejectMethod
};
