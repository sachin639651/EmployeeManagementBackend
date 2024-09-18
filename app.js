const express=require('express')
const mysql=require('./sql').connection
const app=express()
app.use(express.json())
const fileupload = require("express-fileupload");
const { uuid } = require('uuidv4');
app.use(fileupload());
const bodyParser = require('body-parser');  
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const path=require('path')

app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin); 
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });





app.get("/",(req,res)=>{


    res.send('working')

})


app.post('/login',(req,res)=>{

    try {
        let {name,password}=req.body

        let sql='select * from users where username=? and password=?'
mysql.query(sql,[name,password],(error,result)=>{
if(result.length>0){
    res.cookie('username',result[0].username,{maxAge: 2147483647})
    res.sendStatus(200)
}
else{
res.sendStatus(400)
}

        })
  
    
    } catch (error) {
        console.log(error);
        
    }

})




app.get('/getemployee',(req,res)=>{
try {
    
let sql=`select *, DATE_FORMAT(date, '%Y-%m-%d') AS date_only from employee `

mysql.query(sql,(err,result)=>{

    res.status(200).json(result)
})

} catch (error) {
    console.log(error);
    
}
})






app.post('/getfilteredemployee',(req,res)=>{
    try {
     
        let query=req.body.query;

        
        const isDateQuery = /^(\d{4}-\d{2}-\d{2})$/.test(query); // Simple date format check
        const isNumberQuery = /^\d+$/.test(query); // Simple number check
        
        const sql1 = `
          SELECT *, DATE_FORMAT(date, '%Y-%m-%d') AS date_only
          FROM employee
          WHERE MATCH(name, email, designation, gender, course) 
          AGAINST(? IN NATURAL LANGUAGE MODE)
          OR id = ?
          OR mobile = ?
          OR (${isDateQuery ? 'date = ?' : 'FALSE'})`;
    
    mysql.query(sql1,[query, isNumberQuery ? query : null, query, isDateQuery ? query : null],(err,result)=>{
    if(err){
        console.log(err);
        
    }
        res.status(200).json(result)

        
    })
    
    } catch (error) {
        console.log(error);
        
    }
    })




    app.get('/getimage',(req,res)=>{

        let url = req.query.url;
        if(url){
        res.sendFile(path.join(__dirname, url));}

    })


app.post('/createemployee',async(req,res)=>{

    try {
        const {name,email,mobile,designation,gender,course}=req.body
        let image = req.files ? req.files.profile : null;


let path=null
if(image){
    path='./image/'+uuid()+image.name
 await image.mv(path)
}


let sql='select * from employee where email=?'
mysql.query(sql,[email],(error,result)=>{
if(result.length>0){
res.sendStatus(409)
}else{

let sql='insert into employee (name,email,mobile,designation,gender,course,image) values (?,?,?,?,?,?,?)'

mysql.query(sql,[name,email,mobile,designation,gender,course,path],(error,result)=>{
res.sendStatus(201)
})


}
})

    } catch (error) {
      console.log(error);
        
    }
})



app.post('/updateemployee', async(req, res) => {
    const { name, email, mobile, designation, gender, course,id} = req.body;

    
    let imagedata = req.files ? req.files.profile : null;
    let path = null;

    if (imagedata) {
        path ='./images/' + uuid() + imagedata.name;
       await imagedata.mv(path);
    }

    // Get existing data
    const getExistingDataQuery = 'SELECT name, email, mobile, designation, gender, course,image FROM employee WHERE id = ?';
    
    mysql.query(getExistingDataQuery, [id], (err, results) => {
        if (err) {
            return res.status(500).send('Database query failed');
        }
        if (results.length === 0) {
            return res.status(404).send('No data found for the provided ID');
        }

        const existingData = results[0];
        let sql = 'UPDATE employee SET ';
        let updates = [];
        let values = [];

        // Compare fields and add to update query
        const fields = { name, email, mobile, designation, gender, course ,image:path  };

        for (const [field, newValue] of Object.entries(fields)) {
            if (newValue !== undefined && newValue !== null && existingData[field] !== newValue) {
                updates.push(`${field} = ?`);
                values.push(newValue);
            }
        }

        // Ensure there are fields to update
        if (updates.length > 0) {
            sql += updates.join(', ') + ' WHERE id = ?';
            values.push(id); // Add the id to the values array

            // Execute the update query
            mysql.query(sql, values, (err) => {
                if (err) {
                    console.log(err);
                    
                    return res.status(500).send('Database update failed');
                }
                res.status(200).send('Employee updated successfully');
            });
        } else {
            res.status(200).send('No changes detected');
        }
    });
});



app.post('/deleteemployee',(req,res)=>{
try {

    let id=req.body.id;

let sql='delete from employee where id=?'

let result=mysql.query(sql,[id],(error,result)=>{
res.sendStatus(200)
})

    
} catch (error) {
    console.log(error);
    
}



})



app.post("/getsingledata",(req,res)=>{
try {

    let id=req.body.id;

    let sql='select * from employee where id=?'

    mysql.query(sql,[id],(error,result)=>{
res.status(200).json(result)
    })
    
} catch (error) {
    console.log(error);
    
}
})




app.get('/logout',(req,res)=>{
    res.clearCookie('username', );
    res.sendStatus(200)
})




app.listen(5000,()=>{
console.log('server is running on port 5000')
})

