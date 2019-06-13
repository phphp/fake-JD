// pages/item/item.js

import { ItemModel } from 'item-model.js';
import { CartModel } from '../cart/cart-model.js';

let itemModel = new ItemModel();
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
    this.setData({
      itemId: options.item_id, // 当前 sku id
      dialog: [], // 对话列表
      dialogTime: '', // 对话时间
      message: '', // 对话内容
      scrollTop: 500
    });

    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight, // 页面高度
          dialogContainerHeight: 200
        })
      }
    })

    wx.showLoading({
      title: '加载中',
    });

    itemModel.request({
      url: 'item/' + this.data.itemId
    }).then(res => {
      let skus = res.data.data.spu.skus;
      delete res.data.data.spu.skus;
      let spu = res.data.data.spu;
      delete res.data.data.spu;
      let filter = res.data.data.filter;
      delete res.data.data.filter;

      this.setData({
        sku: res.data.data, // 当前 SKU
        skus, // 同一 SPU 下的所有 SKU
        spu, // 当前 SPU
        filter, // 筛选条件
        // content: res.data.data.content.split(';'), // 商品内容图片
        selectedSpec: false, // 不显示筛选框
        customerService: false, // 不显示客服框
        buyNum: 1,
      });

      res.data.data.specValues.forEach((item) => {
        if (item.spec_id == 1) {
          this.setData({ 'colorIndex': item.value_id });
        }
        if (item.spec_id == 5) {
          this.setData({ 'versionIndex': item.value_id });
        }
      })

      wx.hideLoading();
    }).catch(err => {
      console.log(err);
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.closeSocket();
    wx.onSocketClose(() => { console.log('WebSocket Closed') });
  },

  /**
   * 加入购物车
   */
  addToCart(event) {
    let cartItems = wx.getStorageSync('cartItems');

    if (cartItems) {
      // 判断购物车是否存在加入的商品
      let hasItem = cartModel.hasItem(cartItems, this.data.itemId);

      if (hasItem == false) {
        // 不存在相同商品
        cartItems.push({
          id: this.data.itemId,
          count: 1
        })
      } else {
        // 存在相同商品
        cartItems[hasItem.index].count += 1;
      }
    } else {
      // 购物车没有数据
      cartItems = [{
        id: this.data.itemId,
        count: 1
      }];
    }

    wx.setStorageSync('cartItems', cartItems);
  },

  /**
   * 切换至用户页面
   */
  switchUserPage(event) {
    wx.switchTab({
      url: '/pages/user/user'
    });
  },

  /**
   * 切换至购物车页面
   */
  switchCartPage(event) {
    wx.switchTab({
      url: '/pages/cart/cart'
    });
  },

  /**
   * 筛选属性框
   */
  selectSpec() {
    this.setData({ selectedSpec: true });
  },

  /**
   * 取消筛选属性框
   */
  cancelSelectSpec() {
    this.setData({ selectedSpec: false });
  },

  /**
   * 点击属性，修改选中的 SKU
   */
  tapSpec(event) {
    let colorIndex = event.currentTarget.dataset.colorIndex ?
      event.currentTarget.dataset.colorIndex : this.data.colorIndex;
    let versionIndex = event.currentTarget.dataset.versionIndex ?
      event.currentTarget.dataset.versionIndex : this.data.versionIndex;

    // 用新的规格筛选出的商品
    let newSkuId = this.data.filter.map[colorIndex+'-'+versionIndex];
    this.data.skus.some(item => {
      if (item.id == newSkuId) {
        this.setData({
          sku: item,
          itemId: newSkuId,
          colorIndex: colorIndex,
          versionIndex: versionIndex,
          buyNum: 1
        }, () => {
          return true;
        });
      }
    })
  },

  /**
   * 增减商品数量
   */
  setNum(event) {
    let num = event.currentTarget.dataset.plus == 'true' ? ++this.data.buyNum : --this.data.buyNum;

    // 最小/最大购买数量
    if (num < 1) num = 1;
    if (num > 100) num = 100;

    this.setData({
      buyNum: num 
    });
  },

  /**
   * 显示客服对话框
   */
  showCustomerService(event) {
    this.setData({
      // dialogHeight: this.data.windowHeight - 163,
      dialogContainerHeight: 200,
    })


    this.setData({ customerService: true });

    let access_token = wx.getStorageSync('access_token');
    let authorization = 'Bearer ' + access_token;

    
    wx.connectSocket({
      url: 'ws://xcx.unmp:9501',
      header: {
        'content-type': 'text/html,application/json',
        'Authorization': authorization
      },
      method: 'GET',
      success: function(res) {
        // console.log(res)
      }
    })

    wx.onSocketMessage((res) => {
      let message = res.data;
      let user = '人工智障';
      this._addDialog(message, user);
    });

  },
  /**
   * 取消客服对话框
   */
  cancelCustomerService(event) {
    this.setData({ customerService: false });
    wx.closeSocket();
    wx.onSocketClose(() => { console.log('WebSocket Closed') });
  },
  /**
   * 提交对话
   */
  formSubmit(e) {
    let message = e.detail.value.message;
    let user = '我';
    this._addDialog(message, user);
    this.setData({ message: '' });

    wx.sendSocketMessage({
      data: message
    })

  },
  /**
   * 记录对话
   */
  _addDialog(message, user) {
    let date = new Date();
    if (date.getMinutes().length == 1)
      var time = date.getHours() + ':0' + date.getMinutes();
    else
      var time = date.getHours() + ':' + date.getMinutes();
    let dialog = this.data.dialog;

    // 没有对话时间 || 新的一分钟
    if (this.data.dialogTime == '' || this.data.dialogTime != time) {
      dialog.push({
        message,
        user,
        time
      });
    } else {
      dialog.push({
        message,
        user
      });
    }

    this.setData({
      dialog: dialog,
      dialogTime: time,
      scrollTop: this.data.scrollTop + 100, // 新消息下滚
    });

  },

  /**
   * ios 禁止下拉
   */
  onPageScroll: function (e) {
    if (e.scrollTop < 0) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    }
  },

  /**
   * 焦点输入框，设置对话框内容高度，整体抽屉高度
   */
  onFocus(e) {
    this.setData({
      dialogHeight: this.data.windowHeight - 163 - e.detail.height,
      dialogContainerHeight: this.data.windowHeight - e.detail.height,
    })
  },

  /**
   * 失去焦点
   */
  onBlur(e) {
    this.setData({
      dialogHeight: this.data.windowHeight - 163,
      dialogContainerHeight: this.data.windowHeight,
    })
  },
})