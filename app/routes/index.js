var express = require('express');
var router = express.Router();

// serve para analisar dados de formulários especialmente upload de arquivos
var formidable = require('formidable');

var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/file',(req,res)=>{
  let path = './'+req.query.path;
  if(fs.existsSync(path)){
    fs.readFile(path, (err, data) => {
      if (err) {
        console.error(err);
        res.status(400).json({error: err});
      } else {
        res.status(200).end(data);
      }
    });
  } else {
    res.status(404).json({error:'File not found'});
  }
  
});

router.delete('/file',(req,res)=>{
  let form = new formidable.IncomingForm({
    uploadDir: './upload',
    keepExtensions: true
  });
  form.parse(req,(err, fields, files)=>{
    let path = "./" + fields.path;
    if(fs.existsSync(path)){
      fs.unlink(path, err => { // Asynchronously removes a file or symbolic link
        if(err) res.status(400).json({err});
        // fields é o que não é arquivo que o ajax recebe
        else res.json({fields : fields});
      });
    } else {
      res.status(404).json({error:'File not found'});
    }
    //res.json({fields : fields});
  });
});

router.post('/upload', (req,res)=>{
  let form = new formidable.IncomingForm({ //CHAMANDO FORMULARIO
    uploadDir: './upload',                 //pasta que o arquivo será direcionado
    keepExtensions: true                   //dar uma extensão para o arquivo
  });
  form.parse(req,(err, fields, files)=>{
    // files sao os aruivos recebidos pelo ajax
    res.json({files: files});
  });
});

module.exports = router;
