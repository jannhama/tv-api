process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../../app');
const mongo = require('../../app/helpers/mongo');

const should = chai.should();

chai.use(chaiHttp);

function addChannel(_id, name) {
  return mongo.getDb
    .then(db => db.collection('channels').insertOne({ _id, name }));
}

describe('channel controller', () => {
  before((done) => {
    mongo.getDb
      .then(db => db.collection('channels').removeMany({}))
      .then(() => done());
  });

  after((done) => {
    mongo.getDb
      .then(db => db.collection('channels').removeMany({}))
      .then(() => done());
  });

  it('should return an empty array before inserting any channels via GET /api/channels', (done) => {
    chai.request(app)
      .get('/api/channels')
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.equal(0);
        done();
      });
  });

  it('should create and save a new channel into db without error', (done) => {
    addChannel('mtv3')
      .then(() => {
        done();
      });
  });

  it('should return one channel "mtv3" inside an array via GET /api/channels', (done) => {
    chai.request(app)
      .get('/api/channels')
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.equal(1);
        done();
      });
  });

  it('should create multiple new channels and save into db', (done) => {
    Promise.all([
      addChannel('yle1'),
      addChannel('yle2'),
      addChannel('nelonen'),
    ])
      .then(() => {
        done();
      });
  });

  it('should return 4 channels in an array via /api/channels', (done) => {
    chai.request(app)
      .get('/api/channels')
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.equal(4);
        done();
      });
  });
});
