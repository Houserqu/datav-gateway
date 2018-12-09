const express = require("express")
const httpProxy = require("express-http-proxy")
const app = express()

const userServiceProxy = httpProxy("http://127.0.0.1:7001")

// 身份认证
app.use((req, res, next) => {
  // TODO: 身份认证逻辑
  next()
})

// 代理请求
app.post("/login", (req, res, next) => {
  userServiceProxy(req, res, next)
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});