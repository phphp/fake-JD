// pages/login/register.js
/**
 * 授权登录页面
 * 访问该页面，对于已经授权过的用户，会获取保存 token
 * 没有授权过的用户，会显示授权页面，点击授权按钮后会注册并返回 token
 */

import { BaseModel } from '../../utils/base-model.js';

let baseModel = new BaseModel();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.isAuthorizedUser();
  },

  /**
   * 是否是以前授权过的用户
   * 是的话不用点击授权按钮，直接去服务器端获取 token
   */
  isAuthorizedUser() {
    let that = this;
    wx.getSetting({
      success: function(res) {
        if ( res.authSetting["scope.userInfo"] ) {
          console.log('授权过');
          that.sendUserInfoAndGetToken();
        } else {
          console.log('没有授权过，点击授权按钮才会获取 token');
        }
      }
    })

  },

  /**
   * 发送用户数据换取 token
   * 授权成功会返回上一个页面
   */
  sendUserInfoAndGetToken() {
    wx.login({
      success: function (res) {
        let code = res.code;
        wx.getUserInfo({
          success: function (res) {
            let params = {
              url: 'wx/register',
              method: 'POST',
              data: {
                js_code: code,
                rawData: res.rawData,
                signature: res.signature
              }
            };
            baseModel.request(params).then(res => {
              console.log(res);
              console.log('sendUserInfoAndGetToken() set storage data...');
              wx.setStorage({
                key: 'access_token',
                data: res.data.data.access_token
              });
              wx.setStorage({
                key: 'refresh_token',
                data: res.data.data.refresh_token
              });
              // 授权成功返回上一页
              wx.navigateBack({
                delta: 1
              })
            });
          }
        })
      }
    })
  },


})