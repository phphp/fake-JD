// pages/category/category.js

import { CategoryModel } from 'category-model.js';

let categoryModel = new CategoryModel();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeCategoryIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAllCategories();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.showLoading({
      title: '加载中',
    })
  },

  /**
   * 获取所有分类
   */
  getAllCategories() {
    // 获取所有分类数据
    categoryModel.request({
      url: 'categories'
    }).then(res => {
      // 设置所有分类
      this.setData({
        'categories': res.data.data
      });
      // 打开时默认选中第一个分类，显示第一个分类的子分类
      this.setSubCategories(res.data.data[0].all_children);
      wx.hideLoading()
    }).catch(err => {
      console.log(err.data.error);
    });
  },

  /**
   * 设置子分类 subCategories
   * 设置多层分类标识 multiLevelCategories
   */
  setSubCategories(subCategories) {
    // 判断当前选中的分类下是否有2层子分类
    if (subCategories[0].all_children.length == 0)
      this.setData({ 'multiLevelCategories': false });
    else
      this.setData({ 'multiLevelCategories': true });

    this.setData({
      'subCategories': subCategories
    });
  },

  /**
   * 显示当前点击分类的子分类
   */
  show(event) {
    // 再次点击激活的页面不继续处理
    if (this.data.activeCategoryIndex == event.currentTarget.dataset.tapIndex) {
      return;
    }
    // 设置新 index
    this.setData({
      'activeCategoryIndex': event.currentTarget.dataset.tapIndex
    });

    let subCategories = this.data.categories[this.data.activeCategoryIndex].all_children;
    this.setSubCategories(subCategories);
  },

  /**
   * 点击子分类
   */
  tapCategoryItem(event) {
    wx.navigateTo({
      url: './items?category_id=' + event.currentTarget.dataset.categoryId,
    })
  }

})