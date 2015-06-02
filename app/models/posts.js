var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postsSchema = new Schema({
    ID: Schema.Types.ObjectId,
    author: String,
    tags: [String],
    title: String,
    media: String,
    body: String,
    created: { type: Date, default: Date.now },
    comments: [{
            author: String,
            body: String,
            date:  { type: Date, default: Date.now },
    }]
});

module.exports = mongoose.model('Post', postsSchema);
