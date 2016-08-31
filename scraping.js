const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');
const open = require("open");
const request = require('request');
const exec = require('child_process').exec;
var results = [];
// расположение настроек
const configFile = "./config.json";
const dataFile = "./data.json";
const domen = 'http://radiovesti.ru/';
// Программа для редоктирования тегов
const tag_prog = "libs\\kid3-3.4.2-win32\\kid3-cli.exe";
// Директория с mp3
const out_dir = 'C:/Dropbox/apps/Scraping/mp3/';
const mp3_dir = 'C:\\Dropbox\\apps\\Scraping\\mp3\\';
// загрузка mp3
var download = function (uri, filename, callback) {
  request.head(uri, function (err, res, body) {
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};
// Функция для редоктирования тегов
var setTags = function (p_name, p_tags) {
  var l_params = tag_to_param(p_tags),
    l_mp3_path = "\"" + mp3_dir + p_name + "\"",
    l_exec = tag_prog + l_params + " " + l_mp3_path;
  // Изменяем теги
  var child = exec(l_exec,
    function (error, stdout, stderr) {
      if (error) {
        throw error;
      }
      if (stderr) {
        console.log("Warn on file: " + p_name + ": " + stderr);
        return;
      }
      console.log("file tag: " + p_name + " changed");
    });
  // формируем параметры для kid3-cli в формате -c "set [tag] [value]"
  function tag_to_param(p_tags) {
    var l_pars = "";
    for (var p_tag in p_tags) {
      l_pars += " -c \"set " + p_tag + " " + p_tags[p_tag] + "\"";
    }
    return l_pars;
  }
};
// Проверка на частичное вхождения в элемент массива
function chkInArr(p_txt, p_arr) {
  var inText = false;
  for (var i = 0; i < p_arr.length; i++) {
    if (p_txt.indexOf(p_arr[i]) >= 0) {
      inText = true;
      break;
    }
  }
  return inText;
}
// список авторов для игнорирования
function chkText(p_txt) {
  var ignor_text_list = ['Тема:', "Спецпроект:", "Анна Шафран", "Сергей Корнеевский"];
  return chkInArr(p_txt, ignor_text_list);
}

function chkArtist(p_txt) {
  var ignor_artist_list = ["Юденич", "Гросс-Днепров"];
  return chkInArr(p_txt, ignor_artist_list);
}

function addToData(p_arr, p_date, p_num) {
  if (p_arr[p_date]) {
    p_arr[p_date].push(p_num);
  } else {
    p_arr[p_date] = [p_num];
  }
  fs.writeFile(dataFile, JSON.stringify(p_arr, null, 2));
}

function findInArr(array, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == value) return i;
  }
  return -1;
}

function save_mp3(url, p_txt, p_album, p_data, callback) {
  needle.get(url, function (err, res) {
    if (err) throw err;
    // парсим DOM
    var $ = cheerio.load(res.body);
    var l_artist_arr = [];
    // var l_load = false;
    // Выбираем авторов
    $("div.material>h5>a").each(function (i, elem) {
      var l_artist = $(elem).text().trim();
      if (!chkText(l_artist)) {
        l_artist_arr.push($(elem).text().trim())
      }
    });
    var l_artist_list = l_artist_arr.join(', ');
    if (!chkArtist(l_artist_list)) {
      var l_date = p_txt.substr(0, 10),
        l_name = p_txt.substr(10).trim().toString("utf8").replace(/([\"\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\&\:])/g, "");
      // console.log(l_name);
      // console.log(l_name.toString("utf8"));
      // Скачиваем файлы
      $("div.materials_kstati>p>a").each(function (i, elem) {
        var l_url = $(elem).attr("href"),
          l_mp3_arr = l_url.split('/'),
          l_name_arr = l_mp3_arr[l_mp3_arr.length - 1].split('.'),
          l_num = l_name_arr[0],
          l_type = l_name_arr[1],
          l_mp3_name = l_date + ' ' + l_num + ' ' + l_name + '.' + l_type;
        // Оценка нужности скачивания
        if (!p_data[l_date] || findInArr(p_data[l_date], l_num) === -1) {
          download(domen + $(elem).attr("href"), out_dir + l_mp3_name, function () {
            addToData(p_data, l_date, l_num);
            console.log('file: ' + l_mp3_name + ' downloaded');
            setTags(l_mp3_name, {
              track: l_num,
              title: '\\"' + l_name + '\\"',
              artist: '\\"' + l_artist_list + '\\"',
              album: '\\"' + p_album + '\\"'
            });
          });
        }
      });
    }
  });
}

function go_to_url(p_prog, p_data) {
  var l_url = p_prog.url;
  if (l_url) {
    needle.get(l_url, function (err, res) {
      if (err) throw err;
      // парсим DOM
      var $ = cheerio.load(res.body);
      var l_album = $(".brand.material > h4").text();
      // console.log(l_album);
      if (l_album === p_prog.name) {
        $("#brand_episodes li.item>a").each(function (i, elem) {
          var $l_elem = $(elem),
            l_txt = $l_elem.text().trim();
          // if (i < 4) {
          save_mp3(domen + $l_elem.attr("href"), l_txt, l_album, p_data);
          // }
        });
      } else {
        console.log("Warn: in the \"" + p_prog.name + "\" program change url");
      }
    });
  }
}
// results = {
//   "Полный контакт": "25.08.2016"
// };
// fs.writeFileSync('./data.json', JSON.stringify(results, null, 4));
// считываем данные из файла в формате JSON 
function readFileToJSON(p_file, callback) {
  fs.readFile(p_file, 'utf8', function (err, contents) {
    if (err) throw err;
    // console.log("contents length: " + contents.length);
    var l_data;
    // если файл пуст
    if (contents.length === 0) {
      callback();
    } else {
      try {
        // пытаемся преобразовать в JSON
        l_data = JSON.parse(contents);
        if (l_data) {
          callback(l_data);
        }
      } catch (err) {
        console.log("Warn: The file does not contain data in JSON format");
        callback();
      }
    }
  });
};
// Запуск скачивания
readFileToJSON(dataFile, function (data) {
  var l_data = data || {};
  readFileToJSON(configFile, function (progs) {
    l_progs = progs || [];
    l_progs.forEach(function (prog) {
      go_to_url(prog, l_data);
    });
  });
});

