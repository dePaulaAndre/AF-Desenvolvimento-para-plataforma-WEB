const {MongoClient, ObjectId} = require("mongodb");
async function connect(){
 if(global.db) return global.db;
 const conn = await MongoClient.connect("mongodb+srv://depaula:1234@cluster0.edxy1no.mongodb.net/");
 if(!conn) return new Error("Can't connect");
 global.db = await conn.db("avaliacaoFinal");
 return global.db;
}

const express = require('express');
const session = require('express-session');
const app = express(); 
const port = 3000; //porta padrão

app.use(require('cors')());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
 secret: 'your secret here',
 resave: false,
 saveUninitialized: true
}));

//definindo as rotas
const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'Funcionando!' }));

// GET dog
router.get('/dog', async function(req, res, next) {
 try{
 const apidog = await fetch('https://dog.ceo/api/breed/hound/list');
 res.json(await apidog.json());
 }
 catch(ex){
 console.log(ex);
 res.status(400).json({erro: `${ex}`});
 }
}) 

/* GET clientes */
router.get('/clientes/:id?', async function(req, res, next) {
 try{
 const db = await connect();
 if(req.params.id)
 res.json(await db.collection("clientes").findOne({_id: new ObjectId(req.params.id)}));
 else
 res.json(await db.collection("clientes").find().toArray());
 }
 catch(ex){
 console.log(ex);
 res.status(400).json({erro: `${ex}`});
 }
})

// POST /clientes
router.post('/clientes', async function(req, res, next){
 try{
 const clientes = req.body;
 const db = await connect();
 res.json(await db.collection("clientes").insertOne(clientes));
 }
 catch(ex){
 console.log(ex);
 res.status(400).json({erro: `${ex}`});
 }
})

// PUT /clientes/{id}
router.put('/clientes/:id', async function(req, res, next){
 try{
 const clientes = req.body;
 const db = await connect();
 res.json(await db.collection("clientes").updateOne({_id: new ObjectId(req.params.id)}, {$set: clientes}));
 }
 catch(ex){
 console.log(ex);
 res.status(400).json({erro: `${ex}`});
 }
})

// DELETE /clientes/{id}
router.delete('/clientes/:id', async function(req, res, next){
 try{
 const db = await connect();
 res.json(await db.collection("clientes").deleteOne({_id: new ObjectId(req.params.id)}));
 }
 catch(ex){
 console.log(ex);
 res.status(400).json({erro: `${ex}`});
 }
})

//Bloco adicionado para iniciar sessão 
router.post('/login', async function(req, res) {
  const db = await connect();
  const user = await db.collection("clientes").findOne({ emailUsuario: req.body.email });
  if (!user) {
    return res.status(401).json({ message: 'O e-mail digitado não existe.' });
  }
  if (user.senhaUsuario !== req.body.password) {
    return res.status(401).json({ message: 'Senha incorreta.' });
  }
  req.session.user = user;
  res.json({ message: 'Logged in successfully' });
});


app.use('/', router);

//inicia o servidor
app.listen(port);
console.log('API funcionando!');
