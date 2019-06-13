import { BaseModel } from '../../utils/base-model.js';

class UserModel extends BaseModel {

  constructor() {
    super();
  }

  // 查询用户页面基本数据
  index() {
    return new Promise((resolve, reject) => {
      this.request({
        token: true,
        url: 'user'
      }).then(res => {
        resolve(res.data);
      }).catch(err => {
        reject(err);
      })
    });
  }

}

export { UserModel };