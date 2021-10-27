const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');



const app = express();

const port = 40000;

const connectionString = {
    user:'sa',
    password: 'R0bertStrife',
    server:'66.175.236.212',
    port:1433,
    database:'UrielChaconDB',
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
})

const pool = new sql.ConnectionPool(connectionString);
const poolConnect = pool.connect();

pool.on('error', err=>{
    console.log(err);
})

app.get('/', function(req,res){
    res.send('Goodness');
})

app.get('/api/hello', function(req,res){
    res.send({message:"buenas"}); 
})

// Select * FROM Producs
app.get('/api/myselectquery',(req,res)=>{
    deadpool(req,res);
})

async function deadpool(req, res,q){
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
     let q = 'SELECT *FROM UserOwner';
     deadpool(req, res,q);
 })

app.get('/api/user/:uId', (req, res) => {
    const{idGovernment} = req.params;
    let q = "SELECT * FROM UserOwner WHERE uId='"+uId+"'";
    deadpool(req, res,q);
})

app.post('/api/userRegister', (req, res) => {
    let _bd = req.body;

    let q = "INSERT INTO UserOwner (uName,uPwdHash,uEmail,uPhone,uTimestamp,hId,roId)values('"+_bd.uName+"','"+_bd.uPwdHash+"',"+_bd.uEmail+",'"+_bd.uPhone+"','"+_bd.uTimestamp+"','"+_bd.hId+"','"+_bd.roId+"')"

    deadpool(req, res,q);
})

 app.put('/api/userUpdate', (req, res) => {
     let _bd = req.body;

     let q = "UPDATE UserOwner set uName = '"+_bd.uName+"',uPwdHash='"+_bd.uPwdHash+"',uEmail="+_bd.uEmail+",uPhone='"+_bd.uPhone+"',uTimestamp='"+_bd.uTimestamp+"',hId='"+_bd.hId+"',roId='"+_bd.roId+"' WHERE uId='"+_bd.uId+"'"

     deadpool(req, res,q);
 })

 app.delete('/api/userDelete/:uId', (req, res) => {
     const{uId} = req.params;

     let q = "DELETE UserOwner WHERE uId='"+uId+"'"

     deadpool(req, res,q);
 })


/////////////////////////////////////////// --- House --- ///////////////////////////////////////////

app.get('/api/houses', (req, res) => {
    let q = 'SELECT *FROM House';
    deadpool(req, res,q);
})

app.get('/api/house/:hId', (req, res) => {
    const{idGovernment} = req.params;
    let q = "SELECT * FROM House WHERE hId='"+hId+"'";
    deadpool(req, res,q);
})

app.post('/api/houseRegister', (req, res) => {
    let _bd = req.body;

    let q = "INSERT INTO House (hNumber,hAddress,uId,isPaid,hDebt,hMonthlyMount)values('"+_bd.hNumber+"','"+_bd.hAddress+"',"+_bd.uId+",'"+_bd.isPaid+"','"+_bd.hDebt+"','"+_bd.hMonthlyMount+"')"

    deadpool(req, res,q);
})

 app.put('/api/houseUpdate', (req, res) => {
     let _bd = req.body;

     let q = "UPDATE House set hNumber = '"+_bd.hNumber+"',hAddress='"+_bd.hAddress+"',uId="+_bd.uId+",isPaid='"+_bd.isPaid+"',hDebt='"+_bd.hDebt+"',hMonthlyMount='"+_bd.hMonthlyMount+"' WHERE hId='"+_bd.hId+"'"

     deadpool(req, res,q);
 })

 app.delete('/api/houseDelete/:hId', (req, res) => {
     const{hId} = req.params;

     let q = "DELETE House WHERE hId='"+hId+"'"

     deadpool(req, res,q);
 })


/////////////////////////////////////////// --- Payment --- ///////////////////////////////////////////


app.get('/api/Payments', (req, res) => {
    let q = 'SELECT *FROM Payment';
    deadpool(req, res,q);
})

app.get('/api/user/:pId', (req, res) => {
    const{idGovernment} = req.params;
    let q = "SELECT * FROM Payment WHERE pId='"+pId+"'";
    deadpool(req, res,q);
})

app.post('/api/paymentRegister', (req, res) => {
    let _bd = req.body;

    let q = "INSERT INTO Payment (pDate,pExpireDate,pAmount,hId)values('"+_bd.pDate+"','"+_bd.pExpireDate+"',"+_bd.pAmount+",'"+_bd.hId+"')"

    deadpool(req, res,q);
})

 app.put('/api/paymentUpdate', (req, res) => {
     let _bd = req.body;

     let q = "UPDATE Payment set pDate = '"+_bd.pDate+"',pExpireDate='"+_bd.pExpireDate+"',pAmount="+_bd.pAmount+",hId='"+_bd.hId+"',hId='"+_bd.hId+"' WHERE pId='"+_bd.pId+"'"

     deadpool(req, res,q);
 })

 app.delete('/api/paymentDelete/:pId', (req, res) => {
     const{hId} = req.params;

     let q = "DELETE Payment WHERE pId='"+pId+"'"

     deadpool(req, res,q);
 })


// app.post('/api/login',(req,res)=>{

//     let _bd = req.body;

//     let q = "SELECT roId FROM Tuser where uName = '"+_bd.uName+"' AND uPwdHash = '"+_bd.uPwdHash+"'";

//     deadpool(req,res,q);
// })


/////////////////////////////////////////// --- End --- ///////////////////////////////////////////


app.listen(port, function () {
    console.log('running at port: ' + port);
});