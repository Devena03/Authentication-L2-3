import express from "express";
import bodyParser from "body-parser";
import Cred from './models/cred.js'
import bcrypt from 'bcrypt'

const app = express();
const port = 3000;

//Number of salt roudd more it is more time needed to crack
const saltRounds=10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});


app.post("/register", async (req, res) => {
const username=req.body.username;
const password=req.body.password;

try {
  bcrypt.hash(password,saltRounds,async(err,hash)=>{
      if(err){
        console.log("Error while generating hash!");
      }  
      else{
        const cred=new Cred({
          username:username,
          password:hash,
        });
        const savedProduct = await cred.save();
        console.log('Product saved successfully:');
        res.render("secrets.ejs");
      } 
      });
      // Handle success
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error
      console.error('Email already exists');
      res.status(400).send('Email already exists');
    } else {
      console.error(err);
      res.status(500).send('Error registering user');
    }
  }
 
});


app.post("/login", async (req, res) => {
  try{
    const username=req.body.username;
    const userLogiPassword=req.body.password;
    const user= await Cred.findOne({username:username});
    const storedPass=user.password;
    if(user!=null){
      bcrypt.compare(userLogiPassword,storedPass,(err,result)=>{
      //result -->true if matched
       if(err){
         console.log("Error while comparing!");
       }
       else{
        if(result){
          res.render('secrets.ejs');
        }
        else{
         res.send("Incorrect Password!");
        }
       }
      });
  }
  else{
  res.status(400).send("No Such User Found!");
  }
}
  catch(err){
    console.log(err);
    res.send("Error in loging!");
  }
  
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
