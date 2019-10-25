/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-10-20 16:51:48
 * @LastEditTime: 2019-10-25 20:40:58
 * @LastEditors: Please set LastEditors
 */
var express = require("express");
const http = require("http");
var bodyParser = require("body-parser");
const mysql = require("mysql");

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With,Content-Type,Access-Token"
  );
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", " 3.2.1");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

app.use(express.static("public"));

//数据连接池
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "15186478704scs?",
  database: "news"
});

//链接数据库
var query = function(sql, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject(err);
      } else {
        connection.query(sql, values, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
          connection.release();
        });
      }
    });
  });
};

//查询数据
var getData = async function(VALUES) {
  //var {userName, userPassword} = VALUES;
  var sql = `SELECT * FROM user WHERE userName=? and userPassword=?`;
  var data = await query(sql, VALUES);
  if(data.id){
    return(1);
  }
  else {
    return(0);
  }
  console.log(data);
};

//加入数据
var addData = async function(VALUES) {
  var sql = `INSERT INTO user
    (userName, userPassword)
    VALUES
    (?, ?)
    `;
  var data = await query(sql, VALUES);
};

//更新数据
var updataData = async function(VALUES) {
  var sql = `UPDATA user SET userPassword = ? WHERE userName = ?`;
  var data = await query(sql, VALUES);
  console.log(data);
};

//查询new中的id和title
var newsFindData = async function() {
  var sql = `SELECT id,title FROM new`;
  var data = await query(sql);
  return data;
};

//查询new中的detail
var newsFindDetail = async function(VALUES) {
  var sql = `SELECT detail FROM new WHERE id = ?`;
  var data = await query(sql, VALUES);
  return data;
};

//处理请求

//注册请求
app.post("/zhuche", function(req, res) {
  var data = req.body;
  var { userName, userPassword } = data;
  addData([userName, userPassword]);
  console.log(userName, userPassword);
  res.json("传入成功！");
});

//登陆请求
app.post("/denglu", function(req, res) {
  var data = req.body;
  console.log(data);
  var { userName, userPassword } = data;
  if (getData([userName, userPassword])) {
    res.json(1);
  } else {
    res.json(0);
  }
});

//news请求
app.post("/news", async function(req, res) {
  var data = await newsFindData();
  res.json(data);
});

//detail请求
app.post("/detail", async function(req, res) {
    var { id } = req.body;
    console.log(id);
    var data = await newsFindDetail(id);
    console.log(data);
    res.json(data);
});

var server = app.listen(8080, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log("应用实例，访问地址为http://%s:%s", host, port);
});
