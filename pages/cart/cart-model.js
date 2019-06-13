import { BaseModel } from '../../utils/base-model.js';

class CartModel extends BaseModel {

  constructor() {
    super(); // 调用基类的构造函数
  }

  /**
   * 判断 cartItems 是否含有 ID 为 itemId 的商品
   */
  hasItem(cartItems, itemId) {
    let result = false;

    for (let i = 0; i < cartItems.length; i++) {
      if (cartItems[i].id == itemId) {
        result = {
          index: i,
          data: cartItems[i]
        };
        break;
      }
    }

    return result;
  }

  /**
   * 获取购物车商品价格小记
   */
  getSubtotal(items) {
    let sum = 0;
    for (let i = 0; i < items.length; i++) {
      sum += items[i].count * items[i].price;
    }
    return sum;
  }

  /**
   * 查询购物车缓存中的商品
   */
  index(cartItems) {
    return new Promise((resolve, reject) => this.request({
      token: true,
      url: 'cart/index',
      method: 'POST',
      data: {
        'cartItems': cartItems
      }
    }).then(res => {
      let items = res.data.data;
      let hasSoldOutItem = false;

      for (let i = 0; i < items.length; i++) {
        if (items[i].quantity > 50) {
          var arr = Array.from({ length: 50 }, (v, k) => k + 1);
        } else {
          var arr = Array.from({ length: items[i].quantity }, (v, k) => k + 1);
        }
        items[i].pickerArray = arr; // picker range
        for (let l = 0; l < cartItems.length; l++) {
          if (items[i].item_id == cartItems[l].id) {
            // 是否有货
            if (items[i].quantity < cartItems[l].count) {
              if (items[i].quantity > 0) {
                items[i].soldOut = '仅剩 ' + items[i].quantity + ' 件';
              } else {
                items[i].soldOut = '暂时缺货';
              }
              hasSoldOutItem = true;
            } else {
              items[i].soldOut = false;
            }
            items[i].count = cartItems[l].count; // picker value
          }
        }
      }
      let subtotal = this.getSubtotal(items);

      let rs = {
        items: items,
        subtotal: subtotal,
        hasSoldOutItem: hasSoldOutItem
      };

      resolve(rs);
    }).catch(err => {
      console.log('cartModel.index()->catch');
      reject(err);
    })
    )

  }

  /**
   * 生成订单
   */
  store(cartItems, callback) {
    let params = {
      url: 'order',
      token: true,
      method: 'POST',
      data: {
        'cartItems': cartItems
      }
    };

    return new Promise((resolve, reject) => {
      this.request(params).then(res => {
        resolve(res);
      });
    });

  }

}

export { CartModel };