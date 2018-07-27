if (process.env.NODE_ENV === 'production') {
  module.exports = {mongoURI: 'mongodb://rangigo:Tango9506500@ds257241.mlab.com:57241/vidtube-prod'}
} else {
  module.exports = {mongoURI: 'mongodb://rangigo:Panigo010697@ds247121.mlab.com:47121/rangigo'}
}