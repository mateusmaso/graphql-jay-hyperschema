var user = {
  id: 1,
  age: 24,
  name: "Mateus Maso",
  email: "m.maso25@gmail.com",
  image: {
    small: "https://dl.dropboxusercontent.com/u/17997239/avatar.jpeg",
    large: "https://dl.dropboxusercontent.com/u/17997239/avatar.jpeg"
  }
}

var posts = [{
  id: 1,
  title: "Post 1",
  creatorId: 1
}, {
  id: 2,
  title: "Post 2",
  creatorId: 1
}]

var postsUrls = [
  "/posts/1",
  "/posts/2"
]

module.exports = {
  user: user,
  posts: posts,
  postsUrls: postsUrls
}
