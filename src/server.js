const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');

const app = express();

const port = process.env.PORT || 40000;

const connectionString = {
    user:'sa',
    password: 'R0bertStrife',
    server:'66.175.236.212',
    port:1433,
    database:'LosTechos',
    options: {
        encrypt: false,
        trustServerCertificate: false
    }
}

app.use(bodyParser.json({limit:'100mb'}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit:'100mb'
}));
app.use(cors());

app.all('*', function(req,res,next){
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods','PUT,GET,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers','Content-Type');
    next();
});

const pool = new sql.ConnectionPool(connectionString);
const poolConnect = pool.connect();

pool.on('error', err=>{
    console.log(err);
});

app.get('/', function(req,res){
    res.send('Goodness');
});

app.get('/api/hello', function(req,res){
    res.send({message:"buenas"}); 
});

// Select * FROM Producs
app.get('/api/myselectquery',(req,res)=>{
    deadpool(req,res);
});

async function deadpool(req, res, q){
    let _bod = req.body;

    await poolConnect;

    try {
        //LOGIC FOR RUNNING SQL QUERY
        const request = pool.request();
        const result = await request.query(q);
        console.dir(result);
        console.log(result);

        if (result.recordset) {
             if (result.recordset.length > 0) {
                res.send(result.recordset);
            }
        }
        return result;
    } catch (err) {
        console.error("SQL Error", err);
    }

}



/////////////////////////////////////////// --- Register User --- ///////////////////////////////////////////

 app.get('/api/users', (req, res) => {
     let q = 'SelectAllUserOwners;';
     deadpool(req, res,q);
 });

app.get('/api/user/:uId', (req, res) => {
    const{uId} = req.params;
    let q = `SelectUserOwner ${uId};`;
    deadpool(req, res,q);
});

app.post('/api/userRegister', (req, res) => {
    let _bd = req.body;
    let q = `AddUserOwner '${_bd.uName}','${_bd.uPwdHash}','${_bd.uEmail}','${_bd.uPhone}',${_bd.roId};`;
    deadpool(req, res,q);
});

 app.put('/api/userUpdate', (req, res) => {
     let _bd = req.body;
     let q = `UpdateUserOwner ${_bd.uId},'${_bd.uName}','${_bd.uPwdHash}','${_bd.uEmail}','${_bd.uPhone}',${_bd.roId};`;
     deadpool(req, res,q);
 });

 app.delete('/api/userDelete/:uId', (req, res) => {
     const{uId} = req.params;
     let q = `DeleteUserOwner ${uId};`;
     deadpool(req, res,q);
 });

/////////////////////////////////////////// --- House --- ///////////////////////////////////////////

app.get('/api/houses', (req, res) => {
    let q = `SelectAllHouses;`;
    deadpool(req, res,q);
});

app.get('/api/house/:hId', (req, res) => {
    const{hId} = req.params;
    let q = `SelectHouse ${hId};`;
    deadpool(req, res,q);
});

app.post('/api/houseRegister', (req, res) => {
    let _bd = req.body;
    let q = `AddHouse ${_bd.hNumber}, '${_bd.hAddress}', ${_bd.hMonthlyMount};`;
    deadpool(req, res,q);
});

 app.put('/api/houseUpdate', (req, res) => {
     let _bd = req.body;
     let q = `UpdateHouse ${_bd.hId}, ${_bd.hNumber}, '${_bd.hAddress}', ${_bd.hMonthlyMount};`;
     deadpool(req, res,q);
 });

 app.delete('/api/houseDelete/:hId', (req, res) => {
     const{hId} = req.params;
     let q = `DeleteHouse ${hId};`;
     deadpool(req, res,q);
 });

/////////////////////////////////////////// --- Payment --- ///////////////////////////////////////////

app.get('/api/Payments', (req, res) => {
    let q = `SelectAllPayments;`;
    deadpool(req, res,q);
});

app.get('/api/user/:pId', (req, res) => {
    const{pId} = req.params;
    let q = `SelectPayment ${pId};`;
    deadpool(req, res,q);
});

app.post('/api/paymentRegister', (req, res) => {
    let _bd = req.body;
    let q = `AddPayment ${_bd.pAmount}, ${_bd.hNumber};`;
    deadpool(req, res,q);
});

 app.put('/api/paymentUpdate', (req, res) => {
     let _bd = req.body;
     let q = `UpdatePayment ${_bd.pId}, ${_bd.pAmount}, ${_bd.hNumber};`;
     deadpool(req, res,q);
 });

 app.delete('/api/paymentDelete/:pId', (req, res) => {
     const{pId} = req.params;
     let q = `DeletePayment ${pId}`
     deadpool(req, res,q);
 });

 /////////////////////////////////////////// --- Login --- ///////////////////////////////////////////

// app.post('/api/login',(req,res)=>{

//     let _bd = req.body;

//     let q = "SELECT roId FROM UserOwner WHERE uName = '"+_bd.uName+"' AND uPwdHash = '"+_bd.uPwdHash+"'";

//     deadpool(req,res,q);
// })


/////////////////////////////////////////// --- End --- ///////////////////////////////////////////


app.listen(port, function () {
    console.log('running at port: ' + port);
});