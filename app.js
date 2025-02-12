const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000; // Replace with your desired port

// Configure EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', './views'); 
app.use('/public', express.static('public'));

var session = require('express-session');

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
  secret: "yoursecret",
  resave: true,
  saveUninitialized: true,
}))

// MySQL connection configuration
const pool = mysql.createConnection({
  host: 'localhost', // Hostname
  user: 'root', // Your MySQL username
  password: '', // Your MySQL password
  database: 'project_fs' // Name of your database
});

pool.connect((err) => {
  if (err) {
      console.error('Database connection failed: ' + err.stack);
      return;
  }
  console.log('Connected to database');
});


// Route to render the product selection form
app.get('/', (req, res) => {
  res.render('index',{title: "Home"}); 
});

app.get('/login', (req, res) => {
  const successMessage = req.query.success;
  res.render('login', {success: successMessage, title: "Login"}); 
});

app.get('/register', (req, res) => {
  res.render('register',{title: "Register"}); 
});


app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/staffonly', (req, res) => {
  if (req.session.loggedin) {
    res.render('staffonly',{session: false, title: "Staff"}); 
  }
  else {
    res.send("Staff Only - Please Login")
  }
});

app.get('/product', (req, res) => {
  if (req.session.loggedin) {
    const successMessage = req.query.success;
    sql21 = 'SELECT DISTINCT type FROM item';
    pool.query(sql21,(err, proType) => {
      if (err) throw err;
      sql22 = 'SELECT DISTINCT brand FROM item';
      pool.query(sql22, (err, proBrand) => {
        if (err) throw err;
        sql23 = 'SELECT DISTINCT model FROM item';
        pool.query(sql23, (err, proModel) => {
          if (err) throw err;
          res.render('product',{proType: proType, proBrand: proBrand, proModel: proModel, success: successMessage, title: "Product"}); 
        });
      });
    });
  }
  else {
    res.send("Staff Only - Please Login")
  };
});

app.get('/getBrands/:type', (req, res) => {
  const type = req.params.type;
  const sql25 = 'SELECT DISTINCT brand FROM item WHERE type = ?';
  pool.query(sql25, [type], (err, results) => {
      if (err) throw err;
      res.json(results.map(row => row.brand));
  });
});

app.get('/getModels/:type/:brand', (req, res) => {
  const type = req.params.type;
  const brand = req.params.brand;
  const sql26 = 'SELECT DISTINCT model FROM item WHERE type = ? AND brand = ?';
  pool.query(sql26, [type, brand], (err, results) => {
      if (err) throw err;
      res.json(results.map(row => row.model));
  });
});

app.get('/customer', (req, res) => {
  if (req.session.loggedin) {
    const successMessage = req.query.success;
    res.render('customer', { success: successMessage, title: "Customer"}); 
  }
  else {
    res.send("Staff Only - Please Login")
  }
});

app.get('/prosearch', (req, res) => {
  if (req.session.loggedin) {
    res.render('prosearch', {results: null, title: "Search" });
  }
});

app.get('/faultrep', (req, res) => {
  if (req.session.loggedin) {
    res.render('faultrep', { results: null, title: "Fault" });
  }
  else {
    res.send("Staff Only - Please Login")
  }
});

app.get('/faultack', (req, res) => {
  if (req.session.loggedin) {
    const successMessage = req.query.success;
    res.render('faultack', { success: successMessage, title: "Acknowledge"}); 
  }
  else {
    res.send("Staff Only - Please Login")
  }
});

app.get('/updatefault', (req, res) => {
  if (req.session.loggedin) {
    res.render('updatefault', { results: null, title: "Update" });
  }
  else {
    res.send("Staff Only - Please Login")
  }
});

app.get('/closing', (req, res) => {
  if (req.session.loggedin) {
    const successMessage = req.query.success;
    res.render('closeack',{ success: successMessage, title: "Closed"});
  }
  else {
    res.send("Staff Only - Please Login")
  }
});

app.get('/pendreport', (req, res) => { 
  if (req.session.loggedin) {
    sql24 = 'SELECT DISTINCT type FROM item';
    pool.query(sql24,(err, proType) => {
      if (err) throw err;
      res.render('pendreport', {proType: proType,  results: null, title: "Report" });
    });
  }
  else {
    res.send("Staff Only - Please Login")
  }
});

// Route to handle customer submission
app.post('/auth', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  if (username && password) {
      let sql1 = 'SELECT * FROM users WHERE username = ? AND password = ?';
      pool.query(sql1, [username,password], (error, results) => {
        if (error) throw error;
        if (results.length > 0) {
            req.session.loggedin = true;
            let session = req.session.loggedin;
            res.render('staffonly', {session: session, results: results, title: "Staff"})
            app.get('/profile', (req, res) => {
                res.render('profile',{results: results, title: "Profile"}); 
            });
        } else { 
            res.send("Incorrect Username and/or Password! ");
        }
        res.end();
      });
  } 
});

app.post('/authnext',(req, res) => {
  let name = req.body.name;
  let team = req.body.team;
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;
  let password2 = req.body.password2;
  if (password === password2) {
    if (email.includes('@abc.com')) {
        let sql2 = 'INSERT INTO users (name, team, email, username, password) VALUES (?, ?, ?, ?, ?)'; 
        pool.query(sql2, [name, team, email, username, password], (error, results) => {
          if (error) throw error;
          res.render('login', {name, name, success: 'Registered Successfully! Please Login', title: "Login"} );
          res.end();
        })
    } else {
      res.send("eMail invalid! Please enter company eMail address ");
    }
  }
  else {
    res.send("Password mismatch! Please Retry ");
  }
});

app.post('/addCustomer', (req, res) => {
  try {
    // Extract customer data from request body
    const name = req.body.name;
    const address = req.body.address;
    const phone = req.body.phone;
    const email = req.body.email;
    

    const sql3 = `
      INSERT INTO customer (
        name, 
        address, 
        phone, 
        email
      ) 
      VALUES (?, ?, ?, ?)`;

      pool.query(sql3, [name, address, phone, email], (err, results) => {
        if (err) throw err;
        const sql4 = `SELECT id FROM customer ORDER BY id DESC LIMIT 1;`;
          pool.query(sql4, async (err, Cid) => {
          if (err) throw err;
          const id = Cid[0].id;
          res.render('customer', {cID:id, success: 'Customer added successfully!', title: "Customer" });
        })
    });
  }
  catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error fetching products');
  };
});

// Route to handle product submission
app.post('/submitProduct', (req, res) => {
  try {
    // Extract product data from request body
    const customerId = req.body.customerId;
    const dateOfPurchase = req.body.dateOfPurchase;
    const productType = req.body.productType;
    const brand = req.body.brand;
    const model = req.body.model;
    const warranty = req.body.warranty;
    const serialNumber = req.body.serialNumber;


    // SQL query to insert data
    const sql5 = `
      INSERT INTO products (
        customerId,
        dateOfPurchase,
        productType,
        brand,
        model,
        warranty,
        serialNumber
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    pool.query(sql5,
      [customerId, dateOfPurchase, productType, brand, model, warranty, serialNumber], (err, results) => {
      if (err) throw err;
      const sql6 = `SELECT id FROM products ORDER BY id DESC LIMIT 1;`;
      pool.query(sql6, async (err, Pid) => {
        if (err) throw err;
        const id = Pid[0].id;
        res.render('product',{cID: customerId, pID:id, proType: null, proBrand: null, proModel: null, success: 'Sales Details submitted successfully!', title: "Product"});
      });
    });
  }
  catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error fetching products');
  }
});

app.post('/search', (req, res) => { 
  const { customerID } = req.body;
  const sql7 = 'SELECT p.*, c.name, c.address, c.phone, c.email FROM products p INNER JOIN customer c ON p.customerId = c.id WHERE p.customerId = ?;';
  pool.query(sql7, [customerID], (err, results) => { 
    if (err) throw err;
    res.render('prosearch', {results: results, title: "Search" });
  }); 
});

app.post('/fault', (req, res) => { 
  const { customerID, productID } = req.body;
  const sql8 = 'SELECT p.*, c.name, c.address, c.phone, c.email FROM products p INNER JOIN customer c ON p.customerId = c.id WHERE p.customerId = ? AND p.id = ?';
  pool.query(sql8, [customerID, productID], (err, results) => {
    if (err) throw err;
    res.render('faultrep', { results: results[0], title: "Fault" }); 
  }); 
});

app.post('/ticket', (req, res) => {
  try {
    // Extract product data from request body
    const customerId = req.body.customerId;
    const productId = req.body.productId;
    const reportDate = req.body.reportDate;
    const status = req.body.status;
    const description = req.body.description;

    const sql9 = `
      INSERT INTO faults (
        customerId,
        productId,
        reportDate,
        status,
        description
      )
      VALUES (?, ?, ?, ?, ?)`;

      pool.query(sql9,
      [customerId, productId, reportDate, status, description],
      (err, result) => {
        if (err) throw err;
        const sql10 = `SELECT id FROM faults ORDER BY id DESC LIMIT 1;`;
        pool.query(sql10, async (err, Fid) => {
          if (err) throw err;
          const id = Fid[0].id;
          res.render('faultack', {fID: id, cID: customerId , pID: productId , success: 'Ticket submitted successfully!', title: "Acknowledge"});
        });
      });
  }
  catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error fetching products');
  };
});

app.post('/update', (req, res) => { 
  const { customerID, productID, faultID } = req.body;
  const sql11 = 'SELECT f.*, c.name, c.address, c.phone, c.email, p.dateOfPurchase, p.productType, p.brand, p.model, p.warranty, p.`serialNumber` FROM faults f INNER JOIN products p INNER JOIN customer c ON f.productId = p.id AND f.customerId = c.id WHERE f.productId= ? AND f.customerId = ? AND f.id = ?'
  pool.query(sql11, [productID, customerID,faultID ], (err, results) => { 
    if (err) throw err;
    res.render('updatefault', {results: results[0], title: "Update" }); 
  }); 
});

app.post('/closing', (req, res) => {
  try {
    // Extract ticket data from request body
    const {faultId, closeRemark} = req.body;
    const sql12 =`UPDATE faults SET status = 'closed', closeRemark = ?, closeDate = DATE_FORMAT(CURRENT_DATE, '%Y:%m:%d') WHERE id = ?`;
      pool.query(sql12,
      [closeRemark, faultId],
      (err, result1) => {
        if (err) throw err;
            res.render('closeack', {success: 'Ticket closed successfully!', title: "Closed"});
      });
    }
  catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error fetching products');
  };
});

app.post('/pending', (req, res) => { 
  const {productType, status} = req.body;
  const sql13 = 'SELECT f.*, p.productType, p.brand, p.model FROM faults f JOIN products p ON f.productId = p.id  WHERE f.status = ? AND p.productType = ?';
  pool.query(sql13, [ status, productType], (err, results) => { 
    if (err) throw err;
    res.render('pendreport', {proType: null, results: results, title: "Report"});
  });
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});