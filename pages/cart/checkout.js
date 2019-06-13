// pages/cart/ckeckout.js

import { CartModel } from 'cart-model.js';

let cartModel = new CartModel();

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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.data.cartItems = wx.getStorageSync('cartItems');

    // 查询购物车
    cartModel.index(this.data.cartItems)
      .then(res => {
        this.setData({
          'items': res.items,
          'subtotal': res.subtotal,
          'hasSoldOutItem': res.hasSoldOutItem
        });
      }).catch(err => {
        console.error(err);
      });

  },

  /**
   * 点击确认订单
   */
  confirmOrder() {
    this.data.cartItems = wx.getStorageSync('cartItems');
    cartModel.store(this.data.cartItems)
      .then((res) => {
        console.log(res);
      });
  }


})