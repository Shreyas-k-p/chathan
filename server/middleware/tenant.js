const restrictToTenant = (req, res, next) => {
  // If Super Admin, don't restrict unless a contextId is provided
  if (req.user.role === 'super_admin') {
    const contextId = req.query.restaurantId || req.body.restaurantId;
    if (contextId) {
      req.tenantId = contextId;
    }
    return next();
  }

  // All other roles are strictly restricted to their own restaurant
  if (!req.user.restaurantId) {
    return res.status(403).json({ success: false, message: 'User not associated with a restaurant.' });
  }

  req.tenantId = req.user.restaurantId;
  next();
};

module.exports = restrictToTenant;
