var request = require('supertest');
var async = require('async');
var app = require(process.cwd() + '/app');
var Page = require(process.cwd() + '/app/models/Page');
  
//testovaci data
var data = [
  {title: 'Stranka 1', url: 'stranka-1', content: 'lorem ipsum'},
  {title: 'Stranka 2', url: 'stranka-2', content: 'lorem ipsum 2'}
];

//vlozeni jednoho radku do databaze
function save(doc, cb) {
  var page = new Page();
  for (var field in doc) {
    page[field] = doc[field];
  }
  page.save(cb);         
}
  
describe('API pages', function () {
    
  beforeEach(function(done) {
    Page.remove({}, function(err){
      if (err) return done(err);
      async.forEach(data, save, done);
    }); 
  });
    
  describe('GET /api/pages', function(){
    it('vrati seznam vsech polozek v databazi', function(done){
      request(app)
        .get('/api/pages')
        .expect(200)
        .end(function(err, res) {
          res.body.length.should.eql(2);
          res.body[0].should.include(data[0]);
          done();
        });
    });
    it('vrati jen urcene sloupce', function(done){
      request(app)
        .get('/api/pages?fields=url')
        .expect(200)
        .end(function(err, res) {
          res.body.length.should.eql(2);
          res.body[0].should.not.include({
            title: 'Stranka 1', content: 'lorem ipsum'
          });
          done();
        });
    });
    it('vrati kod 400 pri zadani pole, ktere neexistuje v databazi', function(done){
      request(app)
        .get('/api/pages?fields=abc')
        .expect(400, done);
    });
    it('vrati kod 406 pri pozadavku na jiny format dat nez JSON', function(done){
      request(app)
        .get('/api/pages?fields=abc')
        .set('Accept', 'application/xml')
        .expect(406, done);
    });
  });  
    
  describe('GET /api/pages/:page', function(){
    it('vrati detail jedne stranky', function(done){
      request(app)
        .get('/api/pages/stranka-1')
        .expect(200)
        .end(function(err, res) {
          res.body.should.include(data[0]);
          done();
        });
    });
    it('vrati 404, pokud stranka neexistuje', function(done){
      request(app)
        .get('/api/pages/neexistuje')
        .expect(404, done);
    });
  });
    
  describe('POST /api/pages', function(){
    it('vlozi novou stranku do databaze', function(done){
      request(app)
        .post('/api/pages')
        .send({title: 'titulek ABC', content: 'lorem ipsum set dolorem'})
        .expect(200)
        .end(function(err, res){
          Page.findOne({title: 'titulek ABC'}, function(err, doc) {
            doc.title.should.equal('titulek ABC');
            doc.content.should.equal('lorem ipsum set dolorem');
            done();
          });
        });
    });
    it('vrati 400, pokud chybi titulek nebo obsah', function(done){
      request(app)
        .post('/api/pages')
        .send({})
        .expect(400, done);
    });
    it('vrati 415, pokud byla data zaslana v jinem formatu nez JSON', function(done){
      request(app)
        .post('/api/pages')
        .set('Content-Type', 'application/xml')
        .send('<xml>root</xml>')
        .expect(415, done);
    });
  });
    
  describe('PUT /api/pages/:page', function(){
    it('upravi obsah stranky', function(done){
      request(app)
        .put('/api/pages/stranka-1')
        .send({title: 'titulek ABC', content: 'lorem ipsum set dolorem'})
        .expect(200)
        .end(function(err, res){
          Page.findOne({title: 'titulek ABC'}, function(err, doc) {
            doc.title.should.equal('titulek ABC');
            doc.content.should.equal('lorem ipsum set dolorem');
            done();
          });
        });
    });
    it('vrati 400, pokud chybi titulek nebo obsah', function(done){
      request(app)
        .put('/api/pages/stranka-1')
        .send({})
        .expect(400, done);
    });
    it('vrati 404, pokud stranka neexistuje', function(done){
      request(app)
        .put('/api/pages/neexistuje')
        .send({title: 'titulek ABC', content: 'lorem ipsum set dolorem'})
        .expect(404, done);
    });
    it('vrati 415, pokud byla data zaslana v jinem formatu nez JSON', function(done){
      request(app)
        .put('/api/pages/stranka-1')
        .set('Content-Type', 'application/xml')
        .send('<xml>root</xml>')
        .expect(415, done);
    });
  });
    
  describe('DELETE /api/pages/:page', function(){
    it('smaze stranku z databaze', function(done){
      request(app)
        .del('/api/pages/stranka-1')
        .expect(200)
        .end(function(err, res){
          Page.count({url: 'stranka-1'}, function(err, count) {
            count.should.eql(0);
            done();
          });
        });
    });
    it('vrati 404, pokud stranka neexistuje', function(done){
      request(app)
        .del('/api/pages/neexistuje')
        .expect(404, done);
    });
  });
    
});