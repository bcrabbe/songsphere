var NewPost = function(username, cnf) {
    this.author = username,
    this.title = cnf.title,
    this.media = cnf.media,
    this.postBody = cnf.postBody,
    this.tags = cnf.tags.split(",").map(Function.prototype.call, String.prototype.trim);
};

module.exports = NewPost;
