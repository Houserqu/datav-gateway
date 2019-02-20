const express = require("express")
const httpProxy = require("express-http-proxy")
const session = require('express-session');
const cookieParser = require('cookie-parser');
const checkLogin = require('./middleware/checkLogin')

// user 用户相关
const userServiceProxy = httpProxy("http://127.0.0.1:7002")

// auth 权限相关
const authServiceProxy = httpProxy("http://127.0.0.1:7003")

// passport 鉴权 （登录注册相关）
const passportServiceProxy = httpProxy("http://127.0.0.1:7004")

// static 静态文件
const staticServiceProxy = httpProxy("http://127.0.0.1:7005")


const app = express()

app.use(cookieParser())

app.use(session({
  secret: 'datav',//与cookieParser中的一致
  resave: true,
  saveUninitialized:true
 }));

app.use((req, res, next) => {
  req.headers['certificate-userid'] = req.session.userId;
  next()
})

app.all("/login", (req, res, next) => {
  req.session.userId = 1;
  res.json({ success: true, msg: '登录成功', data: null })
  res.send()
})

app.all("/static/*", (req, res, next) => {
  staticServiceProxy(req, res, next)
})

app.all("/api/passport/*", (req, res, next) => {
  passportServiceProxy(req, res, next)
})

app.all("/api/user/*", (req, res, next) => {
  userServiceProxy(req, res, next)
})

app.all("/api/auth/*", checkLogin, (req, res, next) => {
  console.debug(req.session)
  authServiceProxy(req, res, next)
})

app.listen(7001, function () {
  console.log('Example app listening on port 7001!');
});