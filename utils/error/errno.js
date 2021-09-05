class StatusCodeField {
  constructor(status, message, description) {
    this.status = status;
    this.message = message;
    this.description = description;
  }

  errdata() {
    return {
      status: this.status,
      message: this.message,
      description: this.description,
    }
  }
}

// 4000XX 参数相关错误码
ParamsStatusCode = {
  PARAM_NOT_FOUND: new StatusCodeField(400000, 'Param Not Found', description = '参数不存在')
};

// 9999XX 功能支持相关错误码
SupportStatusCode = {
  QUERY_NOT_SUPPORT: new StatusCodeField(999901, 'Not Enable Database, Query Not Support', description = '未启用数据库，不支持查询')
};

module.exports = {
  SupportStatusCode: SupportStatusCode,
  ParamsStatusCode: ParamsStatusCode,
};
