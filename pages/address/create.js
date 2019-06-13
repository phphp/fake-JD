// pages/address/create.js

import { AddressModel } from 'address-model.js';

let addressModel = new AddressModel();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    /**
     * 默认显示区域可以前端固定，也可以用用户信息的地址返回相应的区域，也可以调用位置
     */
    region: ['北京市', '北京市', '东城区'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取全部省级区域和默认选中的北京地区数据
    addressModel.request({
      token: true,
      url: 'area'
    }).then(res => {
      // 查询到的数据转成 picker 需要的格式
      let defaultProvince = res.data.data.defaultProvince[0];
      // 微信 region picker 固定需要三个地址，如：北京市 北京市 朝阳区
      // 判断是否有三层
      if (defaultProvince.children[0].children.length == 0) {
        var region = [
          defaultProvince.name,
          defaultProvince.name,
          defaultProvince.children[0].name
        ];
      } else {
        var region = [
          defaultProvince.name,
          defaultProvince.children[0].name,
          defaultProvince.children[0].children[0].name
        ];
      }

      this.setData({
        region: region,
        'allProvinces': res.data.data.allProvinces,
      })
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
      url: 'user/address',
      method: 'POST',
      token: true,
      data: data
    }).then(res => {
      wx.navigateTo({
        url: '../address/address',
      })
    });
  },
})