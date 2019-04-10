const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('./public'));
app.use(bodyParser.json());

app.get('/menu', (req, res) => {
    fs.readFile('./db/menu.json', 'utf-8', (err, data) => {
        if(err) {
            return console.log(err);
        }

        res.send(data);
    });
});

app.get('/products', (req, res) => {
  fs.readFile('./db/products.json', 'utf-8', (err, data) => {
    if(err) {
      return console.log(err);
    }

    res.send(data);
  });
});

app.get('/cart', (req, res) => {
  fs.readFile('./db/cart.json', 'utf-8', (err, data) => {
    if(err) {
      return console.log(err);
    }

    res.send(data);
  });
});

app.post('/cart', (req, res) => {
  fs.readFile('./db/cart.json', 'utf-8', (err, data) => {
    if(err) {
      return console.log(err);
    }

    const cart = JSON.parse(data);
    cart.push(req.body);

    fs.writeFile('./db/cart.json', JSON.stringify(cart), (err) => {
      if(err) {
        return console.log(err);
      }

      res.send(req.body);
    });
  });
});

app.patch('/cart/:id', (req, res) => {
  fs.readFile('./db/cart.json', 'utf-8', (err, data) => {
    if(err) {
      return console.log(err);
    }

    let cart = JSON.parse(data);
    
    cart = cart.map((item) => {
      if(item.id === +req.params.id) {
        return { ...item, ...req.body };
      }

      return item;
    });

    fs.writeFile('./db/cart.json', JSON.stringify(cart), (err) => {
      if(err) {
        return console.log(err);
      }

      res.send(cart.find((item) => item.id === +req.params.id));
    });
  });
});

app.delete('/cart/:id', (req, res) => {
    fs.readFile('./db/cart.json', 'utf-8', (err, data) => {
        if(err) {
            return console.log(err);
        }

        const cart = JSON.parse(data);

        cart.splice(cart.indexOf(+req.params.id), 1);

        fs.writeFile('./db/cart.json', JSON.stringify(cart), (err) => {
            if(err) {
                return console.log(err);
            }

            res.send(req.body);
        });
    });
});


app.listen(3000, () => {
  console.log('Server has been started!');
});
