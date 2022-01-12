//..............Include Express..................................//
const express = require('express');
const fs = require('fs');
const ejs = require('ejs');

//..............Create an Express server object..................//
const app = express();

//..............Apply Express middleware to the server object....//
app.use(express.json()); //Used to parse JSON bodies (needed for POST requests)
app.use(express.urlencoded());
app.use(express.static('public')); //specify location of static assests
app.set('views', __dirname + '/views'); //specify location of templates
app.set('view engine', 'ejs'); //specify templating library

//.............Define server routes..............................//
//Express checks routes in the order in which they are defined

app.get('/', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.render("index");
});

app.get('/explore', function(request, response) {
  let posts = JSON.parse(fs.readFileSync('data/posts.json'));
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.render("explore", {
    posts: posts
  });
});

app.get('/posts/makePost', function(request, response) {
  let pseudonyms = JSON.parse(fs.readFileSync('data/pseudonyms.json'));
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.render("posts/makePost", {
    pseudonyms: pseudonyms
  });
});

app.post('/posts/makePost', function(request, response) {
  let posts = JSON.parse(fs.readFileSync('data/posts.json'));
  let pseudonymList = JSON.parse(fs.readFileSync('data/pseudonyms.json'));
  let date = new Date();
  let month = date.getMonth()+1
  let t=request.body.Title.trim();
  let newPost = {
    "Date": month.toString() + "/" + date.getDate().toString() + "/" + date.getFullYear().toString(),
    "Title": request.body.Title.trim(),
    "Link": t.replaceAll(" ", "-"),
    "Pseudonym": request.body.Pseudonym.trim(),
    "Text": request.body.Text.trim().split(/\r?\n/)
  };
  posts[newPost["Link"]]=newPost;
  if (pseudonymList[newPost["Pseudonym"]]){
    pseudonymList[newPost["Pseudonym"]].Posts.push(newPost["Link"])
  }
  fs.writeFileSync('data/posts.json', JSON.stringify(posts));
  fs.writeFileSync('data/pseudonyms.json', JSON.stringify(pseudonymList));
  response.redirect("/posts/makePost")
});

app.get('/posts/:postTitle', function(request, response){
  let posts = JSON.parse(fs.readFileSync('data/posts.json'));
  let postTitle = request.params.postTitle;
  if (posts[postTitle]){
    response.status(200);
    response.setHeader('Content-Type', 'text/html');
    response.render("posts/post", {
      post: posts[postTitle]
    });
  } else {
    response.status(404);
    response.setHeader('Content-Type', 'text/html');
    response.render("error", {
      "errorCode":"404"
    });
  }
});

app.get('/pseudonyms/registerPseudonym', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.render("pseudonyms/registerPseudonym");
});

app.post('/pseudonyms/registerPseudonym', function (request, response){
  let pseudonymList = JSON.parse(fs.readFileSync('data/pseudonyms.json'));
  let newPseudonym = {
    "Pseudonym": request.body.Pseudonym.trim(),
    "Country": request.body.Country.trim(),
    "Age": request.body.Age.trim(),
    "Posts": []
  }
  pseudonymList[newPseudonym['Pseudonym']]=newPseudonym;
  fs.writeFileSync('data/pseudonyms.json', JSON.stringify(pseudonymList));
  response.redirect("/pseudonyms/registerPseudonym")
});

app.get('/reviews/writeReview', function (request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.render("reviews/writeReview");
});

app.get('/reviews/readReviews', function(request, response){
  let reviews = JSON.parse(fs.readFileSync("data/reviews.json"));
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.render("reviews/readReviews", {
    reviews: reviews
  })
});

app.post('/reviews/writeReview', function(request, response){
  let reviews = JSON.parse(fs.readFileSync('data/reviews.json'));
  let newReview = {
    "Name": request.body.Name.trim(),
    "Experience": request.body.Experience.trim(),
    "Return": request.body.Return.trim(),
    "Other": request.body.Other.trim()
  };
  reviews["Review_"+(Object.keys(reviews).length+1).toString()]=newReview;
  fs.writeFileSync('data/reviews.json', JSON.stringify(reviews));
  response.redirect("/reviews/readReviews");
});

// Because routes/middleware are applied in order,
// this will act as a default error route in case of
// a request fot an invalid route
app.use("", function(request, response){
  response.status(404);
  response.setHeader('Content-Type', 'text/html')
  response.render("error", {
    "errorCode":"404"
  });
});

//..............Start the server...............................//
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server started at http://localhost:'+port+'.')
});
