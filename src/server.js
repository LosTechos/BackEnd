const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
//documentation
const swaggerUi = require('swagger-ui-express');

//documentation
const swaggerDocument = require("../swagger.json");

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

const protectedRoutes = express.Router();

app.set('secret',process.env.JWT_KEY);
app.use(bodyParser.json({limit:'100mb'}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit:'100mb'
}));
app.use(cors());

app.all('*', function(req,res,next){
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods','PUT,GET,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers','Accept, Content-Type, Authorization, X-Requested-With');
    next();
});

app.options

protectedRoutes.use((req,res,next)=>{
    const token = req.headers['access-token'];

    if(token){
        jwt.verify(token,app.get('secret'),(err, decoded)=>{
            if(err){
                return res.json({message:"Invalid token"})
            }
            else{
                req.encoded = decoded;
            }
            next();
        });
    }
    else{
        res.send({
            message: 'Token not provided'
        });
    }
});

const pool = new sql.ConnectionPool(connectionString);
const poolConnect = pool.connect();

pool.on('error', err=>{
    console.log(err);
});

app.get('/', protectedRoutes, function(req,res){
    res.send('Goodness');
});

async function deadpool(req, res, q){
    await poolConnect;
    try {
        //LOGIC FOR RUNNING SQL QUERY
        const request = pool.request();
        const result = await request.query(q);
        if (result.recordset) {
             if (result.recordset.length > 0) {
                res.send(result.recordset);
            }
            res.json({message:"No recordset found."});
            return result;
        }
        return result;
    } catch (err) {
        console.error("SQL Error", err);
        res.send({sql_error: err});
    }
}

//documentation
app.use('/api-docs',swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/////////////////////////////////////////// --- Get budget --- ///////////////////////////////////////////

app.get('/api/budget', protectedRoutes, (req, res)=>{
    let q = `SELECT bTotal AS "budget" FROM cBudget`;
    deadpool(req, res, q);
});

/////////////////////////////////////////// --- Expenses --- ///////////////////////////////////////////

app.post('/api/expenseRegister', protectedRoutes, (req, res)=>{
    let _bd = req.body;
    let q = `AddExpense '${_bd.eTitle}','${_bd.eDescription}',${_bd.eAmount};`;
    deadpool(req, res, q);
    res.json({success:"Expense registered successfully"});
});

app.get('/api/expenses', protectedRoutes, (req, res)=>{
    let q = `SelectAllExpenses`;
    deadpool(req, res, q);
});

/////////////////////////////////////////// --- Debt views --- ///////////////////////////////////////////

app.get('/api/debt/:uId', (req, res) => {
    const{uId} = req.params;
    let q = `SELECT * from UserDebt_v(${uId});`;
    deadpool(req, res,q);
});

app.get('/api/debt', (req, res) => {
    let q = `SELECT * from AllUserDebt_v;`;
    deadpool(req, res,q);
});

/////////////////////////////////////////// --- User --- ///////////////////////////////////////////

app.get('/api/users',protectedRoutes, (req, res) => {
    let q = 'SelectAllUserOwners;';
    deadpool(req, res,q);
});

app.get('/api/user/:uId',protectedRoutes, (req, res) => {
    const{uId} = req.params;
    let q = `SelectUserOwner ${uId};`;
    deadpool(req, res,q);
    
});

app.post('/api/userRegister',protectedRoutes, (req, res) => {
    let _bd = req.body;
    let pass = _bd.uPwdHash;

    bcrypt.hash(pass,8,async function(err,Hash){
        if(err){
            res.status(418).json({error:"BASTA PRRO"});
        }else{
            let q = `AddUserOwner '${_bd.uName}','${Hash}','${_bd.uEmail}','${_bd.uPhone}',${_bd.roId}, ${_bd.hNumber}, '${_bd.hAddress}', ${_bd.hMonthlyMount};`;
            deadpool(req, res,q);
            res.json({success:"User registered successfully"});
        }
    });
});
app.put('/api/userUpdate',protectedRoutes, (req, res) => {
    let _bd = req.body;
    let q = `UpdateUserOwner ${_bd.uId},'${_bd.uEmail}','${_bd.uPhone}';`;
    deadpool(req, res,q);
    res.json({success:"User updated"});
});

app.delete('/api/userDelete/:uId',protectedRoutes, (req, res) => {
    const{uId} = req.params;
    let q = `DeleteHouse ${uId};`; //This deletes all record related with the user (house and payments)
    deadpool(req, res,q);
    res.json({success:"User deleted"});
});

/////////////////////////////////////////// --- House --- ///////////////////////////////////////////

app.get('/api/houses',protectedRoutes, (req, res) => {
    let q = `SelectAllHouses;`;
    deadpool(req, res,q);
});

app.get('/api/house/:hId',protectedRoutes, (req, res) => {
    const{hId} = req.params;
    let q = `SelectHouse ${hId};`;
    deadpool(req, res,q);
});

app.put('/api/houseUpdate',protectedRoutes, (req, res) => {
    let _bd = req.body;
    let q = `UpdateHouse ${_bd.hId}, ${_bd.hNumber}, '${_bd.hAddress}', ${_bd.hMonthlyMount};`;
    deadpool(req, res,q);
    res.json({success:"House updated"});
 });

/////////////////////////////////////////// --- Payment --- ///////////////////////////////////////////

app.get('/api/payments',protectedRoutes, (req, res) => {
    let q = `SelectAllPayments;`;
    deadpool(req, res,q);
});

app.get('/api/payment/:pId',protectedRoutes, (req, res) => {
    const{pId} = req.params;
    let q = `SelectPayment ${pId};`;
    deadpool(req, res,q);
});

app.post('/api/paymentRegister',protectedRoutes, (req, res) => {
    let _bd = req.body;
    let q = `AddPayment ${_bd.pAmount}, ${_bd.hNumber};`;
    deadpool(req, res,q);
    res.json({success:"Payment done"});
});

app.put('/api/paymentUpdate',protectedRoutes, (req, res) => {
    let _bd = req.body;
    let q = `UpdatePayment ${_bd.pId}, ${_bd.pAmount}, ${_bd.hNumber};`;
    deadpool(req, res,q);
    res.json({success:"Payment updated"});
 });

 app.delete('/api/paymentDelete/:pId',protectedRoutes, (req, res) => {
    const{pId} = req.params;
    let q = `DeletePayment ${pId}`;
    deadpool(req, res,q);
    res.json({success:"Payment deleted"});
});

/////////////////////////////////////////// --- Upload Image --- ///////////////////////////////////////////

app.put('/api/upload', protectedRoutes,(res, req)=>{ /// user uploads image to payment
    const {uId, pImage} = req.body;
    let q = `UploadImage ${pImage}, ${uId}`;
    deadpool(req, res, q);
    res.json('Payment done, waiting for confirmation.')
});

/////////////////////////////////////////// --- Verify Payment --- ///////////////////////////////////////////

app.get('/api/verify', protectedRoutes,(res, req)=>{ /// get the image from the id ///
    const {uId} = req.body;
    let q = `SelectPaymentImage ${uId}`;
    deadpool(req, res, q);
    res.json('Image received.');
});

app.put('/api/verify', protectedRoutes,(res, req)=>{ /// post the verify and the amount paid ///
    const {uId, isValidate, paidAmount} = req.body;
    let q = `VerifyPayment ${isValidate}, ${paidAmount}, ${uId}`;
    deadpool(req, res, q);
    res.json('Payment verified.');
});

 /////////////////////////////////////////// --- Login --- ///////////////////////////////////////////

 app.post('/api/login',async(req,res)=>{

    let body = req.body;
    let user = body.uName;
    let pass = body.uPwdHash;

    let q = `SELECT * FROM UserOwner WHERE uName ='${user}'`;

    const pool = new sql.ConnectionPool(connectionString);
    pool.on('error',err=>{
        console.log('sql error',err);
    });

    try{
        await pool.connect();
        let result = await pool.request().query(q);
        let passIntheDatabase = result.recordset[0].uPwdHash;//hash
        console.log(result);
        if(!result.recordset[0]){
            res.json({
                access:false,
                message:"User does not exist"
            });
        }
        bcrypt.compare(pass,passIntheDatabase, function(err,_res){
            if(_res==true){
                let _user = result.recordset[0];//it is here so you can query for more columns

                if(_user !== undefined){
                    const payload = {
                        user:_user,
                        check: true
                    };

                    const token = jwt.sign(payload,app.get('secret'),{
                        expiresIn: 1440// sec => 24min
                    });

                    res.json({
                        access:true, //optional
                        message:'Access granted',  //optional
                        token:token,
                        id: result.recordset[0].uId,//optional //user id
                        roId:result.recordset[0].roId,// role id
                        uName: result.recordset[0].uName
                    });
                }
                else{
                    res.json({
                        access:false,
                        message:'Not valid credentials'
                    })
                }
            }else{
                res.json({
                    access:false,
                    message:'Invalid password',
                    error:err
                });
            }
        });
    } catch(err){ 
        res.json({
            access:false,
            message:'User does not exist',
            error:err
        });
    };
});


/////////////////////////////////////////// --- End --- ///////////////////////////////////////////


app.listen(port, function () {
    console.log('running at port: ' + port);
});