// pages/address/edit.js

import { AddressModel } from 'address-model.js';

let addressModel = new AddressModel();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: ['北京市', '北京市', '东城区'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 查询需要修改的地址
    addressModel.request({
      token: true,
      url: 'user/address/' + options.address_id
    }).then(res => {
      // 直辖市
      if (res.data.data.area.parent.parent_id == null) {
        var region = [
          res.data.data.area.parent.name,
          res.data.data.area.parent.name,
          res.data.data.area.name
        ];
      }
      // 省
      else {
        var region = [
          res.data.data.area.parent.parent.name,
          res.data.data.area.parent.name,
          res.data.data.area.name
        ];
      }

      this.setData({
        'region': region,
        'address': res.data.data,
        'address_id': options.address_id
      });

    });
  },

  /**
   * 修改地址
   */
  bindRegionChange(event) {
    this.setData({
      region: event.detail.value
    })
  },

  /**
   * 提交表单
   */
  formSubmit(event) {
    let data = event.detail.value;
    data.area = this.data.region;
    addressModel.request({
      url: 'user/address/' + this.data.address_id,
      method: 'PUT',
      token: true,
      data: data
    }).then(res => {
      wx.navigateTo({
        url: '../address/address',
      })
    });
  },


})