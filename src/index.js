const express = require('express');
const {v4} = require('uuid');
const cors = require('cors');
const app = express();

/** essa chamada diz para o expressJS que ele deve interpretar JSON 
 * no body params */
app.use(cors());
app.use(express.json());

/** Array para guardar informações na memória da aplicação, já que ainda não
 * setamos um banco de dados;
 */
const projects = [];

function logRequest(request, response, next){
  const { method, url } = request;
  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time();
  next(); //próximo middleware
  console.timeEnd();
}

function validadeProjectId(request, response, next){
  const {id} = request.params;
  if(!isUuid(id)){
    return response.status(400).json({error: 'Invalid project ID.'});
  }

  return next();
}

app.use(logRequest);
app.use('/project/:id', validadeProjectId);

/** Busca informações no back-end */
/** Instalei o uuidv4 (yarn add uuidv4) */
app.get("/projects", (request, response) => {
  const {title} = request.query;

  const results = title
    ? projects.filter( project => project.title.includes(title))
    : projects;

  return response.json(results);
});

/** Insere informações no back-end */
app.post('/projects', (request, response) => {
  const {title} = request.body;
  const {owner} = request.body;

  const project = {id: v4(), title, owner}; /** no singular, pq é um único projeto */
  projects.push(project); /** Armazena o projeto enviado no array de projetos */

  return response.json(project);
});

/** Atualiza uma informação no backend. ":id" especifica que é um parâmetro
 * que será recebido pela aplicação.
 * Ex: http://localhost:3333/projects/parametro
 */
app.put('/projects/:id', (request, response) =>{
  const {id} = request.params;
  const {title, owner} = request.body;
  
  const projectIndex = projects.findIndex( project => project.id === id);

  if(projectIndex < 0){
    return response.status(404).json({error: "Project not found."});
  }

  /** Obtém os valores a partir do body */
  const project = {
    id,
    title,
    owner
  };

  projects[projectIndex] = project;
  return response.json(project);
});

/** Remove uma informação do back-end */
app.delete('/projects/:id', (request, response) =>{
  const {id} = request.params;

  const projectIndex = projects.findIndex( project => project.id === id);

  if(projectIndex < 0){
    return response.status(404).json({error: "Project not found."});
  }

  projects.splice(projectIndex, 1);

  return response.status(204).send();
});

app.listen(3333, () =>{
    console.log('Back-end started!!');
});
