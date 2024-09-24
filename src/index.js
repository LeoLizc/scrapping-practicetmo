//@ts-check

import express from 'express';
import morgan from 'morgan';
import { cleanAndInject, getHTML, getHTMLID } from './scrapping.js';

import { examplehtml } from './examplehtml.js'
import { imageInstance } from './axios.js';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Use morgan for logging
app.use(morgan('dev'));

// Use CORS
app.use(cors({
  origin: '*',

}));

/** 
 * Función simulada para obtener HTML por id
 * @param {string} id
*/
function getHTMLMock(id) {
  return examplehtml;
}

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

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// - ------------------------------------CLEAR SECTION-----------------------------------

app.get('/clear/:id', async (req, res) => {
  const id = req.params.id;

  const idClean = await getHTMLID(id);
  res.send(idClean);
});

// - ------------------------------------IMAGE SECTION-----------------------------------

app.get('/image/:date/:idPage/:id', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
