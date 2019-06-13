// pages/user/user.js

import { UserModel } from 'user-model.js';

let userModel = new UserModel();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    statusType: 'default'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 查询用户数据
    userModel.request({
      token: true,
      url: 'user'
    }).then(res => {
      this.setData({
        'user': res.data
      })
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 查询用户最近订单
    userModel.request({
      token: true,
      url: 'user/orders'
    }).then(res => {
      this.setData({
        'orders': res.data.data.data,
        'pagination': {
          'links': res.data.data.links,
          'meta': res.data.data.meta
        }
      })
    });

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('载入中');
    // 下一页订单
    if (this.data.pagination.links.next_with_query) {
      userModel.request({
        token: true,
        fullUrl: this.data.pagination.links.next_with_query
      }).then(res => {
        this.setData({
          'orders': this.data.orders.concat(res.data.data.data),
          'pagination': {
            'links': res.data.data.links,
            'meta': res.data.data.meta
          }
        })
      });
    }
    else {
      console.log('已经到底了');
    }

  },

  /**
   * 按订单状态查询用户订单
   */
  fetchUserOrderByStatus(event) {
    let statusId = event.currentTarget.dataset.statusId;

    this.setData({
      'statusType': statusId
    });

    if (statusId == 'default') {
      var url = 'user/orders';
    } else {
      var url = 'user/orders?status=' + statusId;
    }

    userModel.request({
      token: true,
      url: url
    }).then(res => {
      this.setData({
        'orders': res.data.data.data,
        'pagination': {
          'links': res.data.data.links,
          'meta': res.data.data.meta
        }
      })
    });
  },

  /**
   * 跳转地址管理页面
   */
  showPin(event) {
    wx.navigateTo({
      url: '../address/address',
    })
  },

})