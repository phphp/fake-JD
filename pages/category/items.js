// pages/category/items.js

import { CategoryModel } from 'category-model.js';

let categoryModel = new CategoryModel();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderListTrigger: false,
    soldOutListTrigger: false,
    filterTrigger: false,
    positionFixed: false, // 选择菜单后禁止商品列表滑动
    selectedStockType: 'true', // 选中的 有货/全部 类型

    // 可用排序
    orderBy: {
      0: { name: '综合', value: 'default', order: 'default' },
      1: { name: '销量', value: 'sales_volume', order: 'desc' },
      2: { name: '价格最低', value: 'price', order: 'asc' },
      3: { name: '价格最高', value: 'price', order: 'desc' },
    },
    // 默认排序
    selectedOrder: 0,

    // 筛选属性数组
    specPairs: [],

    // 选中的属性数组，用于 GET 参数
    selectedSpecPairs: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.categoryId = options.category_id; // url 参数
    this.getItems(); // 查询当前分类的商品
    this.getSpecPairs(); // 查询当前分类的筛选属性
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.showLoading({
      title: '加载中',
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 下一页
    if (this.data.pagination.links.next_with_query) {
      categoryModel.request({
        fullUrl: this.data.pagination.links.next_with_query
      }).then(res => {
        this.setData({
          'spus': this.data.spus.concat(res.data.data.data),
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
   * 获取商品
   */
  getItems() {
    let url = 'categories/' + this.data.categoryId + '/items?stock=true';
    this._requestItems(url);
  },

  /**
   * 获取当前分类用于筛选的属性和属性值
   */
  getSpecPairs() {
    categoryModel.request({
      url: 'categories/' + this.data.categoryId + '/specs'
    }).then(res => {
      this.setData({
        'specPairs': res.data.data
      });
    });
  },

  /**
   * 显示排序选项
   */
  showOrderList() {
    if (this.data.orderListTrigger) {
      this.hideWrap();
    } else {
      this.setData({
        'orderListTrigger': true,
        'soldOutListTrigger': false,
        'positionFixed': true,
      });
    }
  },

  /**
   * 显示有货优先选项
   */
  showSoldOutList() {
    if (this.data.soldOutListTrigger) {
      this.hideWrap();
    } else {
      this.setData({
        'soldOutListTrigger': true,
        'orderListTrigger': false,
        'positionFixed': true,
      });
    }

  },

  /**
   * 消除蒙版
   */
  hideWrap() {
    this.setData({
      'soldOutListTrigger': false,
      'orderListTrigger': false,
      'filterTrigger': false,
      'positionFixed': false,
    });
  },

  /**
   * 选择排序方式，查询商品
   */
  selectOrder(event) {
    let id = event.currentTarget.dataset.id;
    let url = this.data.pagination.meta.uri_without_prefix;
    
    // 修改样式
    this.setData({
      'selectedOrder': id
    });
    this.hideWrap();

    // 按当前排序查询数据
    if (this.data.orderBy[id].value == 'default') {
      var data = {}
    } else {
      var data = {
        orderby: this.data.orderBy[id].value,
        sort: this.data.orderBy[id].order
      }
    }

    this._requestItems(url, data);
  },

  /**
   * 显示筛选
   */
  showFilter(event) {
    this.hideWrap();
    this.setData({
      'filterTrigger': true,
      'positionFixed': true,
    });
  },
  /**
   * 隐藏筛选
   */
  hideFilter(event) {
    this.setData({
      'filterTrigger': false,
      'positionFixed': false,
    });
  },

  /**
   * 选中筛选属性
   */
  selectSpec(event) {
    // console.log(event.currentTarget.dataset);
    let selectedSpecPairs = this.data.selectedSpecPairs;
    if (typeof selectedSpecPairs[event.currentTarget.dataset.specId] === 'undefined')
      // spce id 作为键，value id 作为值
      selectedSpecPairs[event.currentTarget.dataset.specId] = event.currentTarget.dataset.valueId;
    else
      // 点击已经选中属性，从数组中删除
      if (selectedSpecPairs[event.currentTarget.dataset.specId] == event.currentTarget.dataset.valueId)
        delete selectedSpecPairs[event.currentTarget.dataset.specId];
      // 如果是选择的同属性的不同值，则设置为这个值
      else
        selectedSpecPairs[event.currentTarget.dataset.specId] = event.currentTarget.dataset.valueId;

    this.setData({
      'selectedSpecPairs': selectedSpecPairs
    });
  },

  /**
   * 跳转商品页面
   */
  showItem(event) {
    wx.navigateTo({
      url: '../item/item?item_id=' + event.currentTarget.dataset.itemId,
    })
  },

  /**
   * 按筛选属性查询商品
   */
  getItemsBySpec() {
    // GET 参数
    let queryString = '';
    this.data.selectedSpecPairs.forEach((value, index) => {
      queryString += index + ':' + value + ',';
    });
    queryString = queryString.substring(0, queryString.length - 1);

    // 隐藏筛选栏
    this.setData({
      'filterTrigger': false,
      'positionFixed': false,
    });

    let url = this.data.pagination.meta.uri_without_prefix;
    let data = {
      'spec': queryString
    }
    this._requestItems(url, data);
  },

  /**
   * 点击 只显示有货/所有，查询商品
   */
  getItemsByStock(event) {
    // 隐藏 有货/所有 列表
    this.hideWrap();

    // 按选择的类型，在工具栏上显示选中的类型
    let selectedStockType = event.currentTarget.dataset.stock;
    this.setData({
      'selectedStockType': selectedStockType
    });

    let url = this.data.pagination.meta.uri_without_prefix;
    let data = {
      stock: selectedStockType
    }
    this._requestItems(url, data);
  },

  /**
   * 查询商品，设置 data，查询时显示载入
   */
  _requestItems(url, data = {}) {
    wx.showLoading({
      title: '加载中',
    });
    // 查询数据
    categoryModel.request({
      url: url,
      data: data
    }).then(res => {
      this.setData({
        'spus': res.data.data.data,
        'pagination': {
          'links': res.data.data.links,
          'meta': res.data.data.meta
        }
      });

      this._sortSkus();
      wx.hideLoading();
    }).catch(err => {
      console.log(err);
      wx.hideLoading();
    });
  },

  /**
   * 按筛选规则排序 SPU 内的 SKUS 
   */
  _sortSkus() {
    let spus = this.data.spus;
    let selectedSpecPairs = this.data.selectedSpecPairs;
    let lengthExceptEmpty = 0; // 剔除 empty slots 的数组实际元素
    selectedSpecPairs.forEach((pair, pairIndex) => {
      lengthExceptEmpty++;
    });

    spus.forEach((value, index) => {
      value.skus.forEach((skuValue, skuIndex) => {

        var count = 0; // 计数器，统计当前 spec value 中有多少满足 selected 的属性

        skuValue.specValues.forEach((specValue, valueIndex) => {
          // 计算选中的属性是否都在当前的 sku 的属性数组中
          selectedSpecPairs.forEach((pair, pairIndex) => {
            // console.log(pair + '--' + specValue.value_id)
            if (pair == specValue.value_id) {
              count++;
            }
          });

        });

        // 如果全部满足，把当前 sku 放到 skus[0] 的位置
        if (count == lengthExceptEmpty) {
          let tmp = skuValue;
          delete spus[index].skus[skuIndex];
          spus[index].skus.unshift(tmp);
        }

      });
    });

    this.setData({
      'spus': spus
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
  }
})