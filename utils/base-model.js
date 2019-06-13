/**
 * BaseModel 基类
 * 调用方法：
 *  1. 引入 base-model.js 文件
 *  2. model extend BaseModel
 *  3. 在 model 的构造函数调用基类的构造函数 super();
 * 
 * 可以作为模型类父类，也可以实例化后调用。
 */
class BaseModel {

  constructor() {
    this._apiUrl = 'http://xcx.unmp/api/v0/'; // API 前缀
    this._url = ''; // 请求地址
    this._method = 'GET'; // 请求方法
    this._header = {
      'Content-type': 'application/json',
      'Accept': 'application/json'
    } // http 头
  }

  /**
   * Promise 封装 wx.request
   * 
   * 作用：
   *    需要登录用户访问的请求，会自动检查是否已经登录，没有登录的用户会先跳转授权页面再返回
   *    如果请求返回 401 结果，会尝试刷新一次 token，刷新成功后重新发送请求，刷新失败则跳转授权页面再次登录
   * 
   * 使用方法
   * 
    baseModel.request({
      token: true,
      url: 'wx/needlogin',
      method: 'POST'
    }).then(res => {
      console.log(res);
    }).catch(err => {
      console.log(err);
    })
   * 
   * @param params 参数对象
   *    url 请求地址
   *    fullUrl 请求全地址，和 url 二选一，带上域名的地址，会覆盖 url 项
   *    method 请求方式，可选，默认 GET
   *    header 自定义 header 对象，会覆盖默认的 header，注意也会覆盖默 header.Authorization
   *    token bool 是否需要认证用户登录，可选，默认不需要认证
   *    data 参数对象
   * @param noRefresh 不刷新令牌，默认 false，决定是否需要在 401 认证失败的情况下用 refresh token 刷新 token
   * @return Promise()
   */
  request(params, noRefresh = false) {

    return new Promise((resolve, reject) => {
      // 设置参数
      this._url = this._apiUrl + params.url;
      if (params.fullUrl) this._url = params.fullUrl;
      this._method = params.method ? params.method : 'GET';
      if (params.header)
        this._header = params.header;
      else {
        if (params.token === true) {
          let access_token = wx.getStorageSync('access_token');
          // 当处理的请求需要 token，但是 token 不存在，通常是用户没有登录授权过
          // 跳转授权页面
          if (! access_token) {
            reject('用户没有登录');
            wx.navigateTo({
              url: '/pages/login/register',
            });
            return;
          }
          // 登录用户的 header
          this._header.Authorization = 'Bearer ' + access_token;
        }
      }

      // 执行请求
      wx.request({
        url: this._url,
        method: this._method,
        header: this._header,
        data: params.data,
        success: res => {
          let code = res.statusCode.toString();

          // 正常状态码返回 resolve
          if (code.charAt(0) == '2') {
            // 非 primise 写法，当传参有 callback 方法，使用传递来的方法
            // params.callback && params.callback(res.data);
            resolve(res);
          }
          // 错误状态码处理
          else {
            // if 401 unauthorized
            if (code == '401' && params.token === true) {
              if (!noRefresh) {
                console.log('401 unauthorized, refresh token...');
                // 刷新 token
                this.refreshToken(params).then(res => {
                  console.log('Token refreshed.');
                  resolve(res);
                }).catch(res => {
                  let code = res.statusCode.toString();
                  if (code == '401') {
                    // 再次返回 401，通常是 refresh token 也失效的情况。
                    // 异常情况：refresh token 成功，本地储存正确的令牌。再次发送请求后依旧返回 401
                    // 可能是由于服务器认证失败（后端bug）造成的，这里可能造成重定向问题，调试请注意。
                    console.log('Refresh token expired, stop request.');

                    // todo: 重新登录的操作
                    wx.navigateTo({
                      url: '/pages/login/register',
                    });

                    reject(res);
                  } else {
                    // 通常意味着刷新 token 后再次发送的请求，返回了非 401 错误
                    // 很少的情况：刷新 token 时 API 返回的错误
                    reject(res);
                  }
                });
              }
              else {
                // 返回 401 但是不需要刷新 token
                // 通常不会有需要用户登录又不允许刷新 token 这样的业务需求
                console.log('401 unauthorized, no need to refresh.');
                reject(res);
              }
            }
            // 非 401 的其他错误状态码
            else {
              console.log('baseModel.request(): Request error, code ' + code);
              reject(res);
            }
          }

        },
        fail: err => {
          console.log('baseModel.request(): wx.request error');
          console.log(err);
          reject(err);
        }
      })
      
    })
  }

  /**
   * 刷新令牌，设置新的 refresh token, access token
   * 并再一次发送上次失败的请求
   */
  refreshToken(originalParams) {
    // 获取 refresh token
    let refreshToken = wx.getStorageSync('refresh_token');

    // 设置参数
    let params = {
      url: 'wx/refresh-token',
      header: {
        'Content-type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + refreshToken,
      },
      method: 'POST'
    }

    // 发送刷新请求
    return new Promise((resolve, reject) => {
      this.request(params, true)
        .then(res => {
          // 刷新成功，设置 token
          wx.setStorageSync('access_token', res.data.access_token);
          wx.setStorageSync('refresh_token', res.data.refresh_token);

          // 再获取一次原来需要获取的资源
          // 第二个参数 true 表示如果这次还是 401 则不再调用 refreshToken()
          return this.request(originalParams, true)
            .then(res => {
              resolve(res);
            })
            .catch(err => {
              // 刷新 token 后再次执行原来的请求，但是返回错误
              reject(err);
            })
        })
        .catch (err => {
          reject(err);
        })
    })
  }


  /**
   * 获取 event data- 绑定的数据，不过也不方便
   * @param object event 事件
   * @return mix 键值
   */
  getEventItem(event, key) {
    return event.currentTarget.dataset[key];
  }


  /**
   * 根据设备实际显示宽度，像素转 rpx
   * 通常用于事件返回尺寸（px）转换成 rpx
   */
  px2rpx(px) {
    let rpx;
    wx.getSystemInfoSync({
      success: (res) => {
        rpx = px * 750 / res.windowWidth; 
      } 
    })
    return rpx;
  }
  /**
   * 和上面相反
   */
  rpx2px(rpx) {
    const res = wx.getSystemInfoSync()
    return rpx / 750 * res.windowWidth;
  } 



}

export {BaseModel};