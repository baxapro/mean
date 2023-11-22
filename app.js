const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const ejs = require('ejs');
const mongoose = require('mongoose');
const {Schema} = require("mongoose");
const Users = require('./module/user');
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(Users.authenticate()));
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());




app.get('/express/:name', (req, res) => {
  const name = req.params.name;
  res.send(`Привет ${name}`);
});

const names = [];





app.listen(3000, () => {
  console.log('Работает на порту 3000');
});





mongoose.connect('mongodb://localhost:27017/bala', { useNewUrlParser: true,useUnifiedTopology: true, });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Ошибка подключения к MongoDB:'));
db.once('open', () => {
  console.log('Успешное подключение к MongoDB');
});

// Определение схемы данных
const bookSchema = new Schema({
  name: String,
  author: String,
  price: Number,
  photo: String,

});

// Создание модели данных на основе схемы
const Book = mongoose.model('Book', bookSchema);

app.get('/',async (req, res) => {
  try {
    const books = await Book.find({});

    res.render('index', {  books});
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить список книг' });
  }
});

app.get('/add-book',isLoggedIn, (req, res) => {
  res.render('form');
});

app.post('/create-book', async (req, res) => {
  try {
    const newBook = await Book.create(req.body);
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ error: 'Не удалось создать книгу' });
  }

});




app.get('/edit-book/:id',isLoggedIn, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    res.render('edit', { book });
  } catch (error) {
    res.status(500).json({ error: 'Не удалось загрузить книгу для редактирования' });
  }
});

// Маршрут для обновления книги
app.post('/update-book/:id', async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ error: 'Не удалось обновить книгу' });
  }
});

app.get('/delete-book/:id',isLoggedIn, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ error: 'Не удалось удалить книгу' });
  }


});



app.post('/register', (req, res) => {
  Users.register(new Users({ username: req.body.username }), req.body.password, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    passport.authenticate('local')(req, res, () => {
      res.redirect('/login');
    });
  });
});

// Логин
app.post('/login', passport.authenticate('local'), (req, res) => {
  res.redirect('/');
});

// Логаут
app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      return res.status(500).json({ error: 'Не удалось выполнить выход' });
    }
    res.redirect('/login');
  });
});

// Защищенный маршрут - требует аутентификации
app.get('/protected', isLoggedIn, (req, res) => {
  res.json({ message: 'Защищенная страница', user: req.user });
});

// Проверка, является ли пользователь аутентифицированным
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
    res.redirect('/login');
}




// app.use(bodyParser.urlencoded({ extended: true }));
//
//
// const isAuthenticated = (req, res, next) => {
//   if (req.session.user) {
//     next();
//   } else {
//     res.redirect('/register');
//   }
// };
//
const isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/welcome');
  }
};


app.get('/register', isNotAuthenticated, (req, res) => {
  res.render('register');
});
//
// app.post('/register', isNotAuthenticated, (req, res) => {
//   res.redirect('/login');
// });
//
app.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login');
});

// app.post('/login', isNotAuthenticated, (req, res) => {
//   req.session.user = req.body.username;
//   res.redirect('/welcome');
// });

app.get('/welcome', isLoggedIn, (req, res) => {
  res.render('welcome', { user: req.session.user });
});


