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
    "Posts": []
  }
  pseudonymList[newPseudonym['Pseudonym']]=newPseudonym;
  fs.writeFileSync('data/pseudonyms.json', JSON.stringify(pseudonymList));
  response.redirect("/pseudonyms/registerPseudonym")
});

/*app.get('/play', function(request, response) {
    let players = JSON.parse(fs.readFileSync('data/post.json'));
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("play", {
      data: players
    });
});

app.get('/results', function(request, response) {
    let players = JSON.parse(fs.readFileSync('data/'));

    //accessing URL query string information from the request object
    let opponent = request.query.opponent;
    let playerThrow = request.query.throw;

    if(players[opponent]){
      let opponentThrowChoices=["Paper", "Rock", "Scissors"];
      let results={};

      results["playerThrow"]=playerThrow;
      results["opponentName"]=opponent;
      results["opponentPhoto"]=players[opponent].photo;
      results["opponentThrow"] = opponentThrowChoices[Math.floor(Math.random() * 3)];

      if(results["playerThrow"]===results["opponentThrow"]){
        results["outcome"] = "tie";
      }else if(results["playerThrow"]==="Paper"){
        if(results["opponentThrow"]=="Scissors") results["outcome"] = "lose";
        else results["outcome"] = "win";
      }else if(results["playerThrow"]==="Scissors"){
        if(results["opponentThrow"]=="Rock") results["outcome"] = "lose";
        else results["outcome"] = "win";
      }else{
        if(results["opponentThrow"]=="Paper") results["outcome"] = "lose";
        else results["outcome"] = "win";
      }

      if(results["outcome"]=="lose") players[opponent]["win"]++;
      else if(results["outcome"]=="win") players[opponent]["lose"]++;
      else players[opponent]["tie"]++;

      //update data store to permanently remember results
      fs.writeFileSync('data/post.json', JSON.stringify(players));

      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.render("results", {
        data: results
      });
    }else{
      response.status(404);
      response.setHeader('Content-Type', 'text/html')
      response.render("error", {
        "errorCode":"404"
      });
    }
});

app.get('/explore', function(request, response) {
  let opponents = JSON.parse(fs.readFileSync('data/post.json'));
  let opponentArray=[];

  //create an array to use sort, and dynamically generate win percent
  for(name in opponents){
    opponents[name].win_percent = (opponents[name].win/parseFloat(opponents[name].win+opponents[name].lose+opponents[name].tie) * 100).toFixed(2);
    if(opponents[name].win_percent=="NaN") opponents[name].win_percent=0;
    opponentArray.push(opponents[name])
  }
  opponentArray.sort(function(a, b){
    return parseFloat(b.win_percent)-parseFloat(a.win_percent);
  })

  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("explore",{
    opponents: opponentArray
  });
});

app.get('/opponent/:opponentName', function(request, response) {
  let opponents = JSON.parse(fs.readFileSync('data/post.json'));

  // using dynamic routes to specify resource request information
  let opponentName = request.params.opponentName;

  if(opponents[opponentName]){
    opponents[opponentName].win_percent = (opponents[opponentName].win/parseFloat(opponents[opponentName].win+opponents[opponentName].lose+opponents[opponentName].tie) * 100).toFixed(2);
    if(opponents[opponentName].win_percent=="NaN") opponents[opponentName].win_percent=0;

    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("opponentDetails",{
      opponent: opponents[opponentName]
    });

  }else{
    response.status(404);
    response.setHeader('Content-Type', 'text/html')
    response.render("error", {
      "errorCode":"404"
    });
  }
});

app.get('/makePost', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("makePost");
});

app.post('/makePost', function(request, response) {
    let opponentName = request.body.opponentName;
    let opponentPhoto = request.body.opponentPhoto;
    if(opponentName&&opponentPhoto){
      let opponents = JSON.parse(fs.readFileSync('data/post.json'));
      let newOpponent={
        "name": opponentName,
        "photo": opponentPhoto,
        "win":0,
        "lose": 0,
        "tie": 0,
      }
      opponents[opponentName] = newOpponent;
      fs.writeFileSync('data/post.json', JSON.stringify(opponents));

      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.redirect("/opponent/"+opponentName);
    }else{
      response.status(400);
      response.setHeader('Content-Type', 'text/html')
      response.render("error", {
        "errorCode":"400"
      });
    }
});*/

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
