//@/ts-check

import express from 'express';
import morgan from 'morgan';
import { cleanAndInject, getHTML, getHTMLID } from './scrapping.js';

import { imageInstance } from './axios.js';
import cors from 'cors';
import compression from 'compression';

import { checkReferer } from './middlewares.js';
import config from './config.js';
import { extractTMOId } from './utils.js';

const app = express();

// Use morgan for logging
app.use(morgan('dev'));

// Use CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.myDomains.some(value => value===origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(compression({
  threshold: 0, // Habilita compresión para todas las respuestas
  level: 9,     // Máximo nivel de compresión
}));

// Set up static folder
app.use(express.static('public'));

app.get('/viewer', (req, res) => {
  res.send('Hello World!');
});

app.get('/viewer/:id/paginated', (req, res) => {
  const id = req.params.id;

  // redirigir a la la misma url sin /paginated
  res.redirect(`/viewer/${id}`);
});

app.get('/viewer/:id/cascade', (req, res) => {
  const id = req.params.id;

  // redirigir a la la misma url sin /paginated
  res.redirect(`/viewer/${id}`);
});

// Endpoint que recibe un id y sirve el HTML limpio
app.get('/viewer/:id', async (req, res) => {
  const id = req.params.id;

  // Obtener el HTML utilizando la función getHTML
  const htmlString = await getHTML(id);

  if (!htmlString) {
    res.status(404).send('No se encontró el HTML');
    return;
  }

  // Limpiar el HTML e inyectar el script
  const cleanedHtml = await cleanAndInject(htmlString);

  // Enviar el HTML limpio como respuesta
  res.send(cleanedHtml);
});

const apiRouter = express.Router();

app.get('/status', (_, res) => {
  res.send('working');
});

// - ------------------------------------CLEAR SECTION-----------------------------------

apiRouter.get('/clear/:id', checkReferer, async (req, res) => {
  const id = req.params.id;

  const idClean = await getHTMLID(id);
  res.json(idClean)
});

apiRouter.get('/navigate', async (req, res) => {
  const { url } = req.query;

  const id = extractTMOId(url);

  if (!id) {
    res.status(400).send('URL inválida');
    return
  }

  res.redirect(`/viewer/${id}`);
});

// - ------------------------------------IMAGE SECTION-----------------------------------

apiRouter.get('/image/:date/:idPage/:id', /**/checkReferer,/**/ async (req, res) => {
  const imageId = req.params.id;
  const date = req.params.date;
  const pageId = req.params.idPage;

  try {
    const response = await imageInstance.get(`/${date}/${pageId}/${imageId}`, {
      responseType: 'stream'
    });

    // Configura el encabezado de respuesta
    res.set('Content-Type', response.headers['content-type'] || 'image/webp');
    res.set('Content-Length', response.headers['content-length']);

    // Envía la imagen al cliente
    // res.send(response.data);
    response.data.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener la imagen');
  }
});


app.use('/api', apiRouter);

export default app;