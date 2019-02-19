module.exports =  function (req, res, next) {
  // 检查 session 中是登录
  if(!req.session.login) {
    res.status(403)
    res.json({
      success: false,
      msg: '请登录'
    })

    res.send()
  } else {
    next()
  }
}