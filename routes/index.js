var express = require('express');
var bodyParser = require("body-parser");

var fs = require('fs');
var path = require('path');

var router = express.Router();
var tree = require('../bin/tree');
var encoding = require("encoding");

var Buffer = require('buffer').Buffer;
var iconv = require('iconv-lite');
const urlencodedParser = bodyParser.urlencoded({extended: false});

var console_path='./data_files';









router.get('/', function(req, res, next) {
    res.render('index', { title: 'SoftLine - Roman Spektor', tree: tree.getTree(console_path)});
});


router.post("/save_files",  function(request, response) { 

    var save_file_data=JSON.parse(request.body.data);
    var save_splitter='\t';
  
    switch(request.body.memory_splitter) {
      case '1':  
      save_splitter="\t";
      break;
      case '2': 
      save_splitter=" ";
      break;
      case '3': 
      save_splitter=";";
      break;  
      default:
      save_splitter="\t";
    }

    var stream = fs.createWriteStream("./data_files/"+request.body.memory_file);


    stream.once('open', function(fd) {
      for (i in save_file_data) {

        if (i==0 && request.body.memory_header=='true') {
          Object.keys(save_file_data[i]).forEach(function(key, index, arrayOfKeys) { 
            if (index==0) {
              stream.write( encoding.convert(key, "win1251", 'utf8'));
            } else {
              stream.write( encoding.convert(save_splitter+key, "win1251", 'utf8'));
            }
          });
         stream.write("\r\n");
        }

        Object.keys(save_file_data[i]).forEach(function(key, index, arrayOfKeys) { 
          if (index==0) {
            stream.write( encoding.convert(save_file_data[i][key], "win1251", 'utf8') );
          } else {
            stream.write(  encoding.convert(save_splitter+save_file_data[i][key], "win1251", 'utf8') );
          }

        });
        
        if (i!=save_file_data.length-1) {
           stream.write("\r\n");
        }
      
      }
      stream.end();
      response.send('Запись прошла успешно!');
   });


});





router.post("/files", urlencodedParser, function (request, response) {

    fs.readFile('./data_files/'+request.body.file_name,  function(err, data) {
        if(err) {
        	response.status(404).send({ error: 'Извините, но такого файла на сервере не существует.' });
         return false;
        }

       var str_win = iconv.decode(Buffer.from(data), 'win1251');
       var array = str_win.toString().split("\r\n");
       var table_arr={'head': [], 'body': []};

       var spliter;

       switch(request.body['radio-stacked']) {
         case '1':  
         spliter="\t";
         break;
         case '2': 
         spliter=" ";
         break;
         case '3': 
         spliter=";";
         break;  
         default:
         spliter="\t";
       }



       for(i in array) {
          array[i]=array[i].split(spliter);
       }


      if (request.body['file_head']) {
        for (i in array[0]) {
          table_arr.head.push({field: array[0][i].split('"').join(""), title: array[0][i].split('"').join(""), halign: 'left', align: 'left', editable: true});
        }
        array.shift();
      } else {
        for (i in array[0]) {
          table_arr.head.push({field: 'col_'+(i++), title: 'col_'+(i++), halign: 'left', align: 'left', editable: true});
        }
      }


      for (var j=0; j<array.length; j++) {
        table_arr.body[j]={};
        for (q in array[j]) {
          if (table_arr.head[q]) {
            table_arr.body[j][table_arr.head[q].field]=change_symbol(array[j][q]);
          } else {
            max_col_count=parseInt(q)+1;
            table_arr.head.push({field: 'col_'+max_col_count, title: 'col_'+max_col_count, halign: 'left', align: 'left', editable: true});
            table_arr.body[j]['col_'+max_col_count]=change_symbol(array[j][q]);
          }
        }
      }
    response.send(table_arr);


  });

});

function change_symbol(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}


module.exports = router;