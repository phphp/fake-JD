// pages/cart/cart.js

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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.data.cartItems = wx.getStorageSync('cartItems');

    // 查询购物车
    cartModel.index(this.data.cartItems).then(res => {
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
   * 商品数量变化
   */
  bindPickerChange(event) {
    this.data.hasSoldOutItem = false;
    let itemId = event.currentTarget.dataset['itemId'];
    let cartItems = this.data.cartItems;
    let items = this.data.items;

    for (let i = 0; i < items.length; i++) {
      for (let l = 0; l < cartItems.length; l++) {
        if (items[i].item_id == cartItems[l].id && cartItems[l].id == itemId) {
          cartItems[l].count = parseInt(event.detail.value) + 1; // 修改 count
          items[i].count = cartItems[l].count; // picker value
          items[i].soldOut = false;
          break;
        }
      }
    }
    let subtotal = cartModel.getSubtotal(items);
    this.setData({
      // index: event.detail.value
      'cartItems': cartItems,
      'items': items,
      'subtotal': subtotal,
    })
    wx.setStorageSync('cartItems', cartItems);
  },

  /**
   * 移除商品
   */
  removeItem(event) {
    let itemId = event.currentTarget.dataset['itemId'];
    let cartItems = this.data.cartItems;
    let items = this.data.items;

    for (let i = 0; i < items.length; i++) {
      for (let l = 0; l < cartItems.length; l++) {
        if (items[i].item_id == cartItems[l].id && cartItems[l].id == itemId) {
          delete cartItems.splice(l, 1);
          delete items.splice(i, 1);
          break;
        }
      }
    }
    let subtotal = cartModel.getSubtotal(items);
    this.setData({
      'cartItems': cartItems,
      'items': items,
      'subtotal': subtotal,
    })
    wx.setStorageSync('cartItems', cartItems);
  },

  /**
   * 点击结算按钮，跳转结算页面
   */
  checkout() {
    if (this.data.hasSoldOutItem == false) {
      wx.navigateTo({
        url: './checkout'
      })
    } else {
      console.log('选中的商品库存不足');
    }

  }

})