import config from "./config.js";

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

export { checkReferer };