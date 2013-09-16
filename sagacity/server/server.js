Posts = new Meteor.Collection("posts");

Meteor.publish("directory", function(){
  return Meteor.users.find({_id: this.userId}, {fields: {'services': 1, 'email': 1, 'subscriptions': 1, 'subscribers': 1}});
});

Meteor.publish("restrictiveUsers", function(user) {
  return Meteor.users.find({'services.twitter.screenName': user});
});

Meteor.publish("posts", function(user) {
  return Posts.find({author: user});
});

Meteor.methods({
  publishPost: function(_title, _content){
    if (Meteor.user() !== null)
    {
      var _author = escape(Meteor.user().services.twitter.screenName);
      if (Posts.find({author: _author, title: _title}).count() !== 0)
      {
        console.log("already exists: " + author + title); 
        throw new Meteor.Error(403, "That post already exists!");
        //return "stop";
      }
      else
      {
        var time = new Date();
        var timestamp = time.getTime();
        Posts.insert({title: _title, urlsafetitle: escape(_title), content: _content, author: _author, time: timestamp, name: Meteor.user().profile.name});
        var ret = {};
        ret.author = _author;
        return ret;
      }
    }
  },

  updatePost: function(_post, _newContent){
    if (Meteor.user() !== null){
      var post = Posts.findOne({_id: _post});
      if (post !== null){
        if (post.author === Meteor.user().services.twitter.screenName){
          Posts.update({_id: _post}, {$set: {content: _newContent}});
          post = Posts.findOne({_id: _post});
        }
        else
          return "this user isn't the author of this post";
      }
      else
        return "post not found";
    }
  },

  deletePost: function(_post) {
    if (Meteor.user() !== null) {
      var post = Posts.findOne({_id: _post});
      if (post !== null){
        if (post.author === Meteor.user().services.twitter.screenName){
          Posts.remove({_id: _post});
        }
      }
    }
  },

  subscribeToAuthor: function(author) {
    if (Meteor.user() !== null){
      Meteor.users.update({'services.twitter.screenName': author}, {$push: {subscribers: Meteor.user().email}});
      Meteor.users.update({_id:Meteor.user()._id}, {$push: {subscriptions: author}});
    }
  },

  unSubscribeFromAuthor: function(author){
    if (Meteor.user() !== null){
      Meteor.users.update({'services.twitter.screenName': author}, {$pull: {subscribers: Meteor.user().email}});
      Meteor.users.update({_id:Meteor.user()._id}, {$pull: {subscriptions: author}});
    }
  },

  changeEmail: function(mail){
    if (Meteor.user() !== null){
      Meteor.users.update({_id:Meteor.user()._id}, {$set: {email: mail}});
    }
  }
});
