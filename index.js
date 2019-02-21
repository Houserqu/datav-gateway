const express = require("express")
const httpProxy = require("express-http-proxy")
const session = require('express-session');
const cookieParser = require('cookie-parser');
const checkLogin = require('./middleware/checkLogin')

// user 用户相关
const loginServiceProxy = httpProxy("http://127.0.0.1:7002", {
  userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
    // 判断 user 代理服务返回结果，如果登录成功，写入 userID 到网关 session

    const dataStr = proxyResData.toString('utf8').replace(/\0/g, "")
    const data = JSON.parse(dataStr);
    if(data.success) {
      console.log('登录成功');
      userReq.session.userId = data.data.id;
    }
    return data
  }
})

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

// 写入 session 中的 userid 信息到 header 中，用于其他服务获取用户信息
app.use((req, res, next) => {
  req.headers['certificate-userid'] = req.session.userId || '';
  next()
})

app.all("/api/login", (req, res, next) => {
  console.log(req.session);
  loginServiceProxy(req, res, next)
})

app.get("/api/logout", (req, res, next) => {
  req.session.regenerate(function(err) {
    // will have a new session here
    if(!err) {
      res.send({ success: true, msg: '注销成功', data: null })
    }
  })
})

app.all("/static/*", (req, res, next) => {
  staticServiceProxy(req, res, next)
})

app.all("/api/passport/*", (req, res, next) => {
  passportServiceProxy(req, res, next)
})

app.all("/api/user/*", checkLogin, (req, res, next) => {
  userServiceProxy(req, res, next)
})

app.all("/api/auth/*", checkLogin, (req, res, next) => {
  authServiceProxy(req, res, next)
})

app.listen(7001, function () {
  console.log('Example app listening on port 7001!');
});