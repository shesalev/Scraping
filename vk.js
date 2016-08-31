// Данные подключения
var VK = require('vksdk');
var l_access_token = '9ecea1a99ecea1a99ea31dd5e99e9d539099ece9ecea1a9c9ac97d1813ef9c9e4292041',
  l_user = 2911821;
// l_user = 316293051,
// Модули
var vk = new VK({
  'appId': 5501497,
  'appSecret': "zU0oQK1KA7GyZ3eaUEAB",
  'language': 'ru'
});
var request = require('request');
var fs = require('fs');
// Функция сохранения фотографии
var download = function (uri, filename, callback) {
  console.log("download");
  request.head(uri, function (err, res, body) {
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};
// Setup server access token for server API methods
vk.on('serverTokenReady', function (_o) {
  // Here will be server access token
  vk.setToken(_o.access_token);
  console.log("serverTokenReady");
  console.log(_o.access_token);
  l_access_token = _o.access_token;
});
// vk.requestServerToken();
// Устанавливаем токен
vk.setToken(l_access_token);
// // Turn on requests with access tokens
// vk.setSecureRequests(true);
// Делаем запрос данных пользователя
// vk.request('users.get', { 'user_id': l_user, fields: "bdate,photo_max,city,education,counters,last_seen,has_mobile,contacts" }, function (_o) {
//   if (_o.response) {
//     var l_user_data = _o.response,
//       l_photo_url = l_user_data[0].photo_max,
//       l_photo_arr = l_photo_url.split('/'),
//       l_photo_name = l_photo_arr[l_photo_arr.length - 1];
//     console.log("user");
//     console.log(l_user_data);
//     // Сохранение фото
//     // download(l_photo_url, 'c:/Soft/img/' + l_photo_name, function () {
//     //   console.log('done ' + l_photo_name);
//     // });
//   }
// });
// vk.request('photos.getUserPhotos', { 'user_id': l_user }, function (_o) {
//   var l_user_data = _o/*.response*/;
//   console.log("getUserPhotos");
//   console.log(l_user_data);
//   // Сохранение фото
//   // download(l_photo_url, 'c:/Soft/img/' + l_photo_name, function () {
//   //   console.log('done ' + l_photo_name);
//   // });
// });
// Фото друзей
l_user = 85463744; //1076819
vk.request('friends.get', { 'user_id': l_user, fields: "bdate,photo_max,city,education,counters,last_seen,has_mobile,contacts,sex" }, function (_o) {
  var l_user_data = _o.response;
  // console.log("getUserPhotos");
  // console.log(l_user_data);
  for (var i = 0; i < l_user_data.count; i++) {
    // var l_user = l_user_data.items[i],
    //   l_photo_url = l_user.photo_max,
    //   l_photo_arr = l_photo_url.split('.'),
    //   l_photo_name =  l_user.id+'_' +l_user.first_name + '_' + l_user.last_name + '.' + l_photo_arr[l_photo_arr.length - 1];
    // console.log(l_user);
    // // Сохранение фото
    // download(l_photo_url, 'c:/Soft/img/' + l_photo_name, function () {
    //   console.log('done ' + l_photo_name);
    // });
    if (l_user_data.items[i].sex === 1) {
      vk.request('users.get', { 'user_id': l_user_data.items[i].id, fields: "bdate,photo_max,city,education,counters,last_seen,has_mobile,contacts,about,domain,sex" }, function (_o2) {
        // console.log(_o2);
        if (_o2.response) {
          var l_user_data2 = _o2.response[0],
            l_photo_url = l_user_data2.photo_max,
            l_photo_arr = l_photo_url.split('/'),
            l_photo_name =  l_user_data2.id+'_' +l_user_data2.first_name + '_' + l_user_data2.last_name + '.' + l_photo_arr[l_photo_arr.length - 1];
          // if (l_user_data2.sex = 1) {
          console.log("user");
          console.log(l_user_data2);
          // }
          // Сохранение фото
          download(l_photo_url, 'c:/Soft/img/' + l_photo_name, function () {
            console.log('done ' + l_photo_name);
          });
        }
      });
    }
  }
});
// Подписки
// vk.request('users.getSubscriptions', { 'user_id': l_user, extended: 0 }, function (_o) {
//   var l_user_data = _o /*.response*/ ;
//   console.log("getUserPhotos");
//   console.log(l_user_data);
// });
// Поиск
// vk.setSecureRequests(true);
// vk.request('users.search', { 'q': 'queenochka', has_photo: 1, sex: 1 }, function (_o) {
//   console.log(_o.response);
// });
// Положение
// vk.request('users.getNearby', { radius: 2 }, function (_o) {
//   console.log(_o.response);
// });
console.log('vk OK');

