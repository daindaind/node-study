const { Post, Hashtag, User } = require("../models");

exports.afterUploadImage = (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
};

exports.uploadPost = async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.body.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          });
        })
      );
      await post.addHashtags(result.map((r) => r[0]));
    }
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ["id", "nick"],
      },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(next);
  }
};

exports.getHashtagPost = async (req, res, next) => {
  const query = req.query.hashtag;
  console.log(query);
  if (!query) {
    res.status(403);
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
      res.status(200).json(posts);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};
