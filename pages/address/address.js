// pages/address/address.js

import { AddressModel } from 'address-model.js';

let addressModel = new AddressModel();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconWidth: 180, // 删除按钮的 css 宽度（单位 rpx）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 查询用户所有收货地址
    addressModel.request({
      token: true,
      url: 'user/addresses'
    }).then(res => {
      res.data.data.forEach((value, index) => {
        res.data.data[index].x = 0; // 设置默认 movable-view x 属性
      })
      this.setData({
        'addresses': res.data.data
      });
    });
  },

  /**
   * 跳转添加新地址页面
   */
  create(event) {
    wx.navigateTo({
      url: '../address/create',
    })
  },

  /**
   * 跳转编辑页面
   */
  edit(event) {
    wx.navigateTo({
      url: '../address/edit?address_id=' + event.currentTarget.dataset.addressId,
    })
  },

  /**
   * 删除一个地址
   */
  delete(event) {
    addressModel.request({
      token: true,
      method: 'DELETE',
      url: 'user/address/' + event.currentTarget.dataset.addressId
    }).then(res => {
      // 从所有收货地址中删除
      this.data.addresses.splice(event.currentTarget.dataset.itemIndex, 1);
      this.setData({
        'addresses': this.data.addresses
      });
    });
  },

  /**
   * 滑动显示删除按钮
   */
  showDelete(event) {
    // 常见情况：直接拖动 / 误操作拖一点点
    // 会触发 friction，通过计算位移距离判断是否显示删除按钮
    // 对于不常见的拖动到一半完全静止后松开，导致无法触发 friction
    // 这时使用 handleTouchStart/End 计算位移尺寸后判断是否显示删除按钮
    if (event.detail.source === 'friction') {

      // 如果位移的宽度不足一半，复位滑动，隐藏删除按钮
      if (Math.abs(event.detail.x) < parseFloat(this.deleteIconWidth/2) ) {
        this.showDeleteIcon(event.currentTarget.dataset['itemIndex'], false);
      }
      // 超过一半，完整显示删除按钮
      else {
        this.showDeleteIcon(event.currentTarget.dataset['itemIndex']);
      }

    }
  },

  /**
   * bindtouchstart 事件，弥补 showDelete 做不到的功能
   */
  handleTouchStart(event) {
    this.startX = event.touches[0].pageX; // 获取起始水平坐标
    this.deleteIconWidth = addressModel.rpx2px(this.data.iconWidth); // 获取删除按钮 px 宽度
  },

  /**
   * bindtouchend 事件
   */
  handleTouchEnd(event) {
    let pageX = event.changedTouches[0].pageX; // 获取拖动结束时的水平坐标

    // 左划
    if ( pageX < this.startX ) {
      if ((this.startX - pageX) < parseFloat(this.deleteIconWidth / 2) ) {
        this.showDeleteIcon(event.currentTarget.dataset['itemIndex'], false);
      } else {
        this.showDeleteIcon(event.currentTarget.dataset['itemIndex']);
      }
    }
    // 右划
    else {
      if ((pageX - this.startX) < parseFloat(this.deleteIconWidth / 2)) {
        this.showDeleteIcon(event.currentTarget.dataset['itemIndex']);
      } else {
        this.showDeleteIcon(event.currentTarget.dataset['itemIndex'], false);
      }
    }

  },

  /**
   * 设置当前地址的 x 属性
   */
  showDeleteIcon(itemIndex, display = true) {
    let addresses = this.data.addresses;
    if (display) {
      addresses.forEach((value, index) => {
        if ( index == itemIndex )
          addresses[index].x = -this.data.iconWidth;
      })
    }
    else {
      addresses.forEach((value, index) => {
        if (index == itemIndex)
          addresses[index].x = 0;
      })
    }
    this.setData({ 'addresses': addresses })
  },

})