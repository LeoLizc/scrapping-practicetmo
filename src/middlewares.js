import config from "./config.js";
import jwt from 'jsonwebtoken';

const myDomain = config.myDomain;

const checkReferer = (req, res, next) => {
  const referer = req.get('referer');
  console.log('referer: ', referer);
  if (referer && referer.startsWith(myDomain)) {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
};

/**
 * Read the token from the cookie and verify it
 */
const checkToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  const payload = jwt.decode(token);

  const user = payload.user;

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      return res.status(401).send('Unauthorized');
    }
    req.user = user;
    next();
  });
};

export { checkReferer, checkToken };